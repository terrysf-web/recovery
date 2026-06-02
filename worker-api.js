const DEFAULT_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-password, x-staff-password"
};

const PROTOCOL_KEY = "protocol";
const CODES_KEY = "access_codes";
const PASSWORD_KEY = "admin_password";

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return emptyResponse(204);
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === "/protocol" && request.method === "GET") {
        return jsonResponse(await readProtocol(env));
      }

      if (url.pathname === "/protocol" && request.method === "POST") {
        await requireAdmin(request, env);
        const protocol = await request.json();
        await kv(env).put(PROTOCOL_KEY, JSON.stringify(protocol));
        return jsonResponse({ ok: true });
      }

      if (url.pathname === "/access-code" && request.method === "POST") {
        await requireStaffOrAdmin(request, env);
        return jsonResponse(await createAccessCodes(request, env));
      }

      if (url.pathname === "/access-code" && request.method === "GET") {
        return jsonResponse(await verifyAccessCode(url, env));
      }

      if (url.pathname === "/access-codes" && request.method === "GET") {
        await requireStaffOrAdmin(request, env);
        return jsonResponse({ codes: await readCodes(env) });
      }

      if (url.pathname === "/access-code/disable" && request.method === "POST") {
        await requireStaffOrAdmin(request, env);
        const { code } = await request.json();
        return jsonResponse(await disableAccessCode(code, env));
      }

      if (url.pathname === "/change-password" && request.method === "POST") {
        return jsonResponse(await changePassword(request, env));
      }

      if (url.pathname === "/" && request.method === "POST") {
        return jsonResponse(await askGemini(request, env));
      }

      return jsonResponse({ error: "Not found" }, 404);
    } catch (error) {
      const status = error.status || 500;
      return jsonResponse({ error: error.message || "Server error" }, status);
    }
  }
};

function kv(env) {
  if (!env.RECOVERY_KV) {
    throw httpError(500, "Missing RECOVERY_KV binding.");
  }
  return env.RECOVERY_KV;
}

function emptyResponse(status) {
  return new Response(null, { status, headers: DEFAULT_CORS_HEADERS });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...DEFAULT_CORS_HEADERS,
      "Content-Type": "application/json"
    }
  });
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function readPassword(env) {
  const saved = await kv(env).get(PASSWORD_KEY);
  return saved || env.ADMIN_PASSWORD || "";
}

async function requireAdmin(request, env) {
  const expected = await readPassword(env);
  const provided = request.headers.get("x-admin-password") || "";
  if (!expected || provided !== expected) {
    throw httpError(401, "Unauthorized");
  }
}

async function requireStaffOrAdmin(request, env) {
  const adminPassword = await readPassword(env);
  const staffPassword = env.STAFF_PASSWORD || adminPassword;
  const provided =
    request.headers.get("x-staff-password") ||
    request.headers.get("x-admin-password") ||
    "";

  if (!provided || (provided !== staffPassword && provided !== adminPassword)) {
    throw httpError(401, "Unauthorized");
  }
}

async function readProtocol(env) {
  const raw = await kv(env).get(PROTOCOL_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function readCodes(env) {
  const raw = await kv(env).get(CODES_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function writeCodes(env, codes) {
  await kv(env).put(CODES_KEY, JSON.stringify(codes));
}

async function createAccessCodes(request, env) {
  const body = await request.json();
  const surgeryType = String(body.surgeryType || "").trim();
  const quantity = Math.max(1, Math.min(50, Number(body.quantity || 1)));
  const chartNumber = String(body.chartNumber || "").trim();

  if (!surgeryType) {
    throw httpError(400, "surgeryType is required");
  }

  const protocol = await readProtocol(env);
  const totalDays = Number(protocol[surgeryType]?.totalDays || body.totalDays || 63);
  const surgeryDate = body.surgeryDate ? String(body.surgeryDate) : "";
  const codes = await readCodes(env);
  const created = [];

  for (let i = 0; i < quantity; i += 1) {
    const code = uniqueCode(codes);
    const item = {
      code,
      surgeryType,
      chartNumber,
      surgeryDate,
      active: true,
      createdAt: new Date().toISOString(),
      expiresAt: surgeryDate ? addDays(surgeryDate, totalDays) : ""
    };
    codes.push(item);
    created.push(item);
  }

  await writeCodes(env, codes);
  return quantity === 1 ? created[0] : { codes: created };
}

async function verifyAccessCode(url, env) {
  const code = String(url.searchParams.get("code") || "").trim().toUpperCase();
  const surgeryDate = String(url.searchParams.get("surgeryDate") || "").trim();
  const deviceToken = String(url.searchParams.get("deviceToken") || "").trim();
  const deviceFingerprint = String(url.searchParams.get("deviceFingerprint") || "").trim();

  if (!code) throw httpError(400, "Code is required");
  if (!surgeryDate) throw httpError(400, "Surgery date is required");

  const protocol = await readProtocol(env);
  const codes = await readCodes(env);
  const item = codes.find(c => String(c.code || "").toUpperCase() === code);

  if (!item || item.active === false) throw httpError(404, "Invalid access code");
  if (item.expiresAt && item.expiresAt < todayYMD()) throw httpError(410, "This recovery code has expired");
  if (item.surgeryDate && item.surgeryDate !== surgeryDate) throw httpError(409, "Surgery date does not match this code");

  const totalDays = Number(protocol[item.surgeryType]?.totalDays || 63);
  item.surgeryDate = surgeryDate;
  item.expiresAt = item.expiresAt || addDays(surgeryDate, totalDays);
  item.deviceToken = item.deviceToken || deviceToken;
  item.deviceFingerprint = item.deviceFingerprint || deviceFingerprint;
  item.firstUsedAt = item.firstUsedAt || new Date().toISOString();
  item.lastUsedAt = new Date().toISOString();

  if (item.deviceToken && deviceToken && item.deviceToken !== deviceToken) {
    throw httpError(409, "This code is already assigned to another device");
  }

  await writeCodes(env, codes);

  return {
    code: item.code,
    surgeryType: item.surgeryType,
    surgeryDate: item.surgeryDate,
    expiresAt: item.expiresAt
  };
}

async function disableAccessCode(code, env) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) throw httpError(400, "Code is required");

  const codes = await readCodes(env);
  const item = codes.find(c => String(c.code || "").toUpperCase() === normalized);
  if (!item) throw httpError(404, "Code not found");

  item.active = false;
  item.disabledAt = new Date().toISOString();
  await writeCodes(env, codes);
  return { ok: true };
}

async function changePassword(request, env) {
  const body = await request.json();
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");
  const expected = await readPassword(env);

  if (!expected || currentPassword !== expected) {
    throw httpError(401, "Current password is incorrect");
  }
  if (newPassword.length < 8) {
    throw httpError(400, "New password must be at least 8 characters");
  }

  await kv(env).put(PASSWORD_KEY, newPassword);
  return { ok: true };
}

async function askGemini(request, env) {
  if (!env.GEMINI_API_KEY) {
    throw httpError(500, "Missing GEMINI_API_KEY secret");
  }

  const body = await request.json();
  const question = String(body.question || "").trim();
  if (!question) throw httpError(400, "Question is required");

  const prompt = [
    "You are a cautious dental recovery assistant.",
    "Give concise general guidance only. Tell the patient to contact the clinic for severe, worsening, or unusual symptoms.",
    `Surgery: ${body.surgeryType || "Dental surgery"}`,
    `Recovery day: ${body.dayLabel || body.day || "unknown"}`,
    `Question: ${question}`
  ].join("\n");

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + encodeURIComponent(env.GEMINI_API_KEY),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw httpError(502, data.error?.message || "Gemini request failed");
  }

  return {
    answer: data.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim() || ""
  };
}

function uniqueCode(existing) {
  let code = "";
  do {
    code = randomCode();
  } while (existing.some(c => String(c.code || "").toUpperCase() === code));
  return code;
}

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < bytes.length; i += 1) {
    out += chars[bytes[i] % chars.length];
  }
  return out;
}

function todayYMD() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(ymd, days) {
  const date = new Date(ymd + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + Math.max(0, Number(days || 0)));
  return date.toISOString().slice(0, 10);
}
