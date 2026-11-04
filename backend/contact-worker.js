import { connect } from "cloudflare:sockets";

/*
  Vantelyra contact Worker (2026-10-12, matches website V83)

  Receives the website's contact form, checks Cloudflare Turnstile, and sends the
  inquiry to the Vantelyra mailbox through GoDaddy SMTP (port 465).

  This file is NOT part of the website. Paste it into the Cloudflare Worker that
  serves /api/contact (vantelyra-contact). The settings below do not change.

  Secrets (Worker → Settings → Variables and Secrets):
    TURNSTILE_SECRET, SMTP_USERNAME, SMTP_PASSWORD
  Optional variables:
    CONTACT_RECIPIENT     mailbox that receives inquiries (default: SMTP_USERNAME)
    CONTACT_FROM_NAME     sender name (default: "Vantelyra Website")
    PUBLIC_CONTACT_EMAIL  address shown to visitors in error messages (default: hello@vantelyra.com)
    ALLOWED_ORIGINS       extra site addresses, comma-separated
    SMTP_HOST, SMTP_PORT  (default: smtpout.secureserver.net, 465)
  Optional binding:
    CONTACT_RATE_LIMIT    a Rate Limiting binding. When it exists, each visitor
                          address is limited to what the binding allows.

  It accepts both the current website and older copies of it, so the Worker and
  the website can be updated in either order.
*/

const WORKER_VERSION = "2026-10-12";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://vantelyra.com",
  "https://www.vantelyra.com",
  "https://vantelyra-website.christian-libuna.workers.dev"
];

// The broad category the form sends as `service` (unchanged from earlier versions).
const SERVICE_CATEGORIES = new Set([
  "Digital Consulting / Inquiry",
  "Cloud & Infrastructure",
  "Data & Analytics",
  "Automation & Workflow",
  "Digital Platforms",
  "Business Operations"
]);

// The exact choice the visitor picked on the website, sent as `serviceChoice`,
// and the category it belongs to. Keep these names in step with the
// "What do you need help with?" list in index.html.
const SERVICE_CHOICES = new Map([
  ["Free Consultation", "Digital Consulting / Inquiry"],
  ["IT Health Check", "Digital Consulting / Inquiry"],
  ["Workspace Setup and Migration", "Cloud & Infrastructure"],
  ["Managed IT Support", "Business Operations"],
  ["Security Essentials", "Cloud & Infrastructure"],
  ["Data and Dashboards", "Data & Analytics"],
  ["Automation and Integration", "Automation & Workflow"],
  ["Business Website", "Digital Platforms"],
  ["Not Sure Yet", "Digital Consulting / Inquiry"]
]);

// Values sent by copies of the website from before October 2026.
const LEGACY_SERVICES = new Map([
  ["Digital consulting / advisory", "Digital Consulting / Inquiry"],
  ["Digital Marketing Operations", "Digital Platforms"]
]);

const LIMITS = { name: 100, email: 254, message: 4000, body: 12000 };
const SMTP_TIMEOUT_MS = 12000;

// ---------- Small helpers ----------

const jsonResponse = (data, status, origin = "") => {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff"
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return new Response(JSON.stringify(data), { status, headers });
};

const normalizeOrigin = (value) => {
  try {
    return new URL(String(value || "").trim()).origin;
  } catch {
    return "";
  }
};

const getAllowedOrigins = (env) => {
  const configured = String(env.ALLOWED_ORIGINS || "").split(",");
  return new Set(
    [...DEFAULT_ALLOWED_ORIGINS, ...configured].map(normalizeOrigin).filter(Boolean)
  );
};

const publicEmail = (env) =>
  String(env.PUBLIC_CONTACT_EMAIL || "hello@vantelyra.com").trim();

// A practical address check: no spaces, quotes, brackets or commas, and a domain
// with at least one dot. Stricter than before, so a crafted address can't add
// extra recipients to the Reply-To line.
const isValidEmail = (email) =>
  email.length <= LIMITS.email &&
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/.test(email);

// One line of plain text: no line breaks or control characters.
const singleLine = (value) =>
  String(value || "").replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();

// Multi-line text: normalise line endings and drop control characters except tabs.
const cleanText = (value) =>
  String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "")
    .trim();

const toBase64 = (value) => {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const wrapBase64 = (value) => toBase64(value).match(/.{1,76}/g)?.join("\r\n") || "";

const encodeHeader = (value) => `=?UTF-8?B?${toBase64(value)}?=`;

const manilaTime = (date) => {
  try {
    return `${new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Manila",
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(date)} (Manila time)`;
  } catch {
    return date.toISOString();
  }
};

// The website puts "Interested in: <choice>" at the top of the message so the
// choice survives even on older Workers. This Worker shows the choice on its own
// line, so that first line is removed to avoid repeating it.
const removeChoiceLine = (message, choice) => {
  if (!choice) return message;
  const prefix = `Interested in: ${choice}`;
  if (!message.startsWith(prefix)) return message;
  const rest = message.slice(prefix.length).trim();
  return rest || message;
};

// Works out what the visitor picked, from the new `serviceChoice` field or the
// older `service` field. An unknown value never blocks an inquiry; it is
// labelled "Other" and noted in the Worker log.
const resolveService = (rawService, rawChoice) => {
  const service = singleLine(rawService);
  let choice = singleLine(rawChoice);

  if (choice && !SERVICE_CHOICES.has(choice)) {
    console.warn("Unknown serviceChoice from the form:", choice.slice(0, 80));
    choice = "";
  }
  if (!choice && SERVICE_CHOICES.has(service)) choice = service;

  let category = SERVICE_CATEGORIES.has(service) ? service : LEGACY_SERVICES.get(service) || "";
  if (!category && choice) category = SERVICE_CHOICES.get(choice);
  if (!category) {
    if (service) console.warn("Unknown service value from the form:", service.slice(0, 80));
    category = "Other";
  }
  return { choice, category };
};

const withTimeout = async (promise, message) => {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), SMTP_TIMEOUT_MS);
      })
    ]);
  } finally {
    clearTimeout(timer);
  }
};

// ---------- SMTP (GoDaddy, implicit TLS on port 465) ----------

const createSmtpResponseReader = (reader) => {
  const decoder = new TextDecoder();
  let buffer = "";

  return async () => {
    const lines = [];
    let responseCode = null;

    while (true) {
      const lineEnd = buffer.indexOf("\r\n");

      if (lineEnd >= 0) {
        const line = buffer.slice(0, lineEnd);
        buffer = buffer.slice(lineEnd + 2);
        lines.push(line);

        const match = /^(\d{3})([ -])(.*)$/.exec(line);
        if (match) {
          if (responseCode === null) responseCode = Number(match[1]);
          if (match[2] === " " && Number(match[1]) === responseCode) {
            return { code: responseCode, message: lines.join("\n") };
          }
        }
        continue;
      }

      const result = await withTimeout(reader.read(), "The SMTP server did not respond in time.");
      if (result.done) throw new Error("The SMTP connection closed unexpectedly.");
      buffer += decoder.decode(result.value, { stream: true });
    }
  };
};

const expectSmtpCode = async (readResponse, allowedCodes, step) => {
  const response = await readResponse();
  if (!allowedCodes.includes(response.code)) {
    throw new Error(`SMTP rejected ${step} (${response.code}).`);
  }
  return response;
};

const writeSmtpCommand = async (writer, readResponse, command, allowedCodes, step) => {
  await withTimeout(
    writer.write(new TextEncoder().encode(`${command}\r\n`)),
    `Could not write ${step} to the SMTP server.`
  );
  return expectSmtpCode(readResponse, allowedCodes, step);
};

const buildInquiryEmail = ({ name, email, choice, category, message, receivedAt }, env) => {
  const smtpUsername = String(env.SMTP_USERNAME || "").trim();
  const recipient = String(env.CONTACT_RECIPIENT || smtpUsername).trim();
  const fromName = singleLine(env.CONTACT_FROM_NAME || "Vantelyra Website");
  const senderDomain = smtpUsername.split("@")[1] || "vantelyra.com";
  const messageId = `<${crypto.randomUUID()}@${senderDomain}>`;
  const serviceName = choice || category;

  const lines = [
    "New inquiry from the Vantelyra website",
    "",
    `Name:      ${name}`,
    `Email:     ${email}`,
    `Service:   ${serviceName}`
  ];
  if (choice && category !== "Other") lines.push(`Category:  ${category}`);
  lines.push(
    `Received:  ${manilaTime(receivedAt)}`,
    "",
    "Message",
    "-------",
    message,
    "",
    "-------",
    `Reply to this email to answer ${name} directly.`
  );

  return [
    `From: ${encodeHeader(fromName)} <${smtpUsername}>`,
    `To: <${recipient}>`,
    `Reply-To: ${encodeHeader(name)} <${email}>`,
    `Subject: ${encodeHeader(`Vantelyra inquiry: ${serviceName} from ${name}`)}`,
    `Date: ${receivedAt.toUTCString()}`,
    `Message-ID: ${messageId}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "X-Auto-Response-Suppress: All",
    "",
    wrapBase64(lines.join("\n").replace(/\n/g, "\r\n"))
  ].join("\r\n");
};

async function sendInquiryEmail(data, env) {
  const hostname = String(env.SMTP_HOST || "smtpout.secureserver.net").trim();
  const port = Number(env.SMTP_PORT || 465);
  const username = String(env.SMTP_USERNAME || "").trim();
  const password = String(env.SMTP_PASSWORD || "");
  const recipient = String(env.CONTACT_RECIPIENT || username).trim();
  const heloDomain = username.split("@")[1] || "vantelyra.com";

  if (!hostname || port !== 465 || !isValidEmail(username) || !password || !isValidEmail(recipient)) {
    throw new Error("The SMTP settings are incomplete or invalid (port must be 465).");
  }

  const socket = connect({ hostname, port }, { secureTransport: "on", allowHalfOpen: true });
  await withTimeout(socket.opened, "The connection to the SMTP server could not be opened.");

  const reader = socket.readable.getReader();
  const writer = socket.writable.getWriter();
  const readResponse = createSmtpResponseReader(reader);

  try {
    await expectSmtpCode(readResponse, [220], "the greeting");
    await writeSmtpCommand(writer, readResponse, `EHLO ${heloDomain}`, [250], "EHLO");
    await writeSmtpCommand(writer, readResponse, "AUTH LOGIN", [334], "AUTH LOGIN");
    await writeSmtpCommand(writer, readResponse, toBase64(username), [334], "the username");
    await writeSmtpCommand(writer, readResponse, toBase64(password), [235], "the password");
    await writeSmtpCommand(writer, readResponse, `MAIL FROM:<${username}>`, [250], "MAIL FROM");
    await writeSmtpCommand(writer, readResponse, `RCPT TO:<${recipient}>`, [250, 251], "RCPT TO");
    await writeSmtpCommand(writer, readResponse, "DATA", [354], "DATA");

    const emailContent = buildInquiryEmail(data, env)
      .split("\r\n")
      .map((line) => (line.startsWith(".") ? `.${line}` : line))
      .join("\r\n");

    await withTimeout(
      writer.write(new TextEncoder().encode(`${emailContent}\r\n.\r\n`)),
      "The inquiry email could not be written to the SMTP server."
    );
    await expectSmtpCode(readResponse, [250], "the message");
    // The message is accepted at this point; a slow goodbye shouldn't fail the send.
    await writeSmtpCommand(writer, readResponse, "QUIT", [221], "QUIT").catch(() => {});
  } finally {
    reader.releaseLock();
    writer.releaseLock();
    await socket.close().catch(() => {});
  }
}

// ---------- Turnstile ----------

async function verifyTurnstile(token, request, env) {
  const formData = new FormData();
  formData.append("secret", env.TURNSTILE_SECRET);
  formData.append("response", token);

  const visitorIp = request.headers.get("CF-Connecting-IP");
  if (visitorIp) formData.append("remoteip", visitorIp);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData
  });

  if (!response.ok) return { success: false, "error-codes": [`http-${response.status}`] };
  return response.json();
}

// ---------- The /api/contact handler ----------

async function handleContact(request, env, origin) {
  const email = publicEmail(env);

  if (!env.TURNSTILE_SECRET || !env.SMTP_USERNAME || !env.SMTP_PASSWORD) {
    console.error("The contact Worker secrets are not configured.");
    return jsonResponse(
      { message: `Our inquiry form is offline right now. Please email us at ${email}.` },
      503,
      origin
    );
  }

  // Optional: limit how often one visitor can send (needs a CONTACT_RATE_LIMIT binding).
  if (typeof env.CONTACT_RATE_LIMIT?.limit === "function") {
    try {
      const key = request.headers.get("CF-Connecting-IP") || "unknown";
      const { success } = await env.CONTACT_RATE_LIMIT.limit({ key });
      if (!success) {
        return jsonResponse(
          { message: "You’ve sent several messages in a short time. Please wait a minute and try again." },
          429,
          origin
        );
      }
    } catch (error) {
      console.warn("Rate limit check skipped:", error);
    }
  }

  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.includes("application/json")) {
    return jsonResponse({ message: "Invalid submission format." }, 415, origin);
  }

  const rawBody = await request.text();
  if (rawBody.length > LIMITS.body) {
    return jsonResponse({ message: "Your message is too long. Please shorten it and try again." }, 413, origin);
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ message: "Invalid form submission." }, 400, origin);
  }
  if (!body || typeof body !== "object") {
    return jsonResponse({ message: "Invalid form submission." }, 400, origin);
  }

  // Honeypot: accept quietly so automated senders don't learn what caught them.
  if (singleLine(body.companyWebsite)) {
    return jsonResponse({ success: true }, 200, origin);
  }

  const name = singleLine(body.name);
  const visitorEmail = singleLine(body.email);
  const { choice, category } = resolveService(body.service, body.serviceChoice);
  const message = removeChoiceLine(cleanText(body.message), choice);
  const turnstileToken = singleLine(body.turnstileToken);

  if (!name || !visitorEmail || !message) {
    return jsonResponse({ message: "Please fill in your name, email and message." }, 400, origin);
  }
  if (!turnstileToken) {
    return jsonResponse(
      { message: "The security check didn’t complete. Please refresh the page and try again." },
      400,
      origin
    );
  }
  if (!isValidEmail(visitorEmail)) {
    return jsonResponse({ message: "Please check your email address and try again." }, 400, origin);
  }
  if (name.length > LIMITS.name || message.length > LIMITS.message) {
    return jsonResponse(
      { message: "Your name or message is too long. Please shorten it and try again." },
      400,
      origin
    );
  }

  let verification;
  try {
    verification = await verifyTurnstile(turnstileToken, request, env);
  } catch (error) {
    console.error("Turnstile verification request failed:", error);
    return jsonResponse(
      { message: `The security check is unavailable right now. Please try again in a minute, or email us at ${email}.` },
      502,
      origin
    );
  }

  const originHostname = new URL(origin).hostname;
  if (!verification.success || verification.action !== "contact" || verification.hostname !== originHostname) {
    console.warn("Turnstile rejected the inquiry:", JSON.stringify({
      success: verification.success,
      action: verification.action,
      hostname: verification.hostname,
      expectedHostname: originHostname,
      errors: verification["error-codes"]
    }));
    return jsonResponse(
      { message: "The security check didn’t pass. Please refresh the page and try again." },
      400,
      origin
    );
  }

  try {
    await sendInquiryEmail(
      { name, email: visitorEmail, choice, category, message, receivedAt: new Date() },
      env
    );
    return jsonResponse({ success: true, message: "Your inquiry has been received." }, 200, origin);
  } catch (error) {
    console.error("Inquiry email delivery failed:", error);
    return jsonResponse(
      { message: `Please try again, or email us at ${email}.` },
      500,
      origin
    );
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = normalizeOrigin(request.headers.get("Origin"));
    const allowedOrigins = getAllowedOrigins(env);

    if (url.pathname !== "/api/contact") {
      return jsonResponse({ message: "Not found." }, 404);
    }

    // Public, read-only check that the Worker is reachable and which version runs.
    if (request.method === "GET") {
      return jsonResponse(
        { success: true, status: "online", version: WORKER_VERSION, message: "Vantelyra contact Worker is online." },
        200,
        allowedOrigins.has(origin) ? origin : ""
      );
    }

    if (!allowedOrigins.has(origin)) {
      return jsonResponse({ message: "Origin not allowed." }, 403);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Accept",
          "Access-Control-Max-Age": "86400",
          "Vary": "Origin"
        }
      });
    }

    if (request.method !== "POST") {
      return jsonResponse({ message: "Method not allowed." }, 405, origin);
    }

    try {
      return await handleContact(request, env, origin);
    } catch (error) {
      console.error("Unexpected contact Worker failure:", error);
      return jsonResponse(
        { message: `Something went wrong on our side. Please try again, or email us at ${publicEmail(env)}.` },
        500,
        origin
      );
    }
  }
};
