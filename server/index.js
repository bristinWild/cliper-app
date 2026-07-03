/**
 * Cliper auth server — GitHub OAuth + JWT issuing.
 *
 * Run:
 *   cd server && npm install && cp .env.example .env  (fill in values)  && node index.js
 *
 * GitHub OAuth App callback URL must be exactly:
 *   http://<YOUR_LAN_IP>:4000/auth/github/callback
 */
require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  JWT_SECRET,
  PORT = 4000,
} = process.env;

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !JWT_SECRET) {
  console.error("Missing env vars — copy .env.example to .env and fill it in.");
  process.exit(1);
}

const app = express();

app.use((req, _res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});

// state -> app deep link, so the callback knows where to send the user back.
// In-memory is fine for dev; use Redis/DB with TTL in production.
const pendingStates = new Map();

// Only ever redirect back into our own app.
function isAllowedRedirect(url) {
  return (
    typeof url === "string" &&
    (url.startsWith("cliper://") || /^exp:\/\/[\w.:-]+\/--\//.test(url) || url.startsWith("exp://"))
  );
}

/** Step 1 — the app opens this in the auth browser. */
app.get("/auth/github/start", (req, res) => {
  const redirect = req.query.redirect;
  if (!isAllowedRedirect(redirect)) return res.status(400).send("Invalid redirect");

  const state = crypto.randomBytes(24).toString("hex");
  pendingStates.set(state, redirect);
  setTimeout(() => pendingStates.delete(state), 10 * 60 * 1000); // 10 min TTL

  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", GITHUB_CLIENT_ID);
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("scope", "read:user"); // add "repo" later when syncing needs it
  res.redirect(authorize.toString());
});

/** Step 2 — GitHub sends the user here; we exchange code for a token server-side. */
app.get("/auth/github/callback", async (req, res) => {
  const { code, state } = req.query;
  const appRedirect = pendingStates.get(state);
  pendingStates.delete(state);
  if (!appRedirect || !code) return res.status(400).send("Invalid or expired OAuth state");

  try {
    // code + client secret -> GitHub access token (secret never touches the phone)
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const { access_token } = await tokenRes.json();
    if (!access_token) return res.status(401).send("GitHub token exchange failed");

    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}`, "User-Agent": "cliper" },
    });
    const ghUser = await userRes.json();

    // Our own session JWT — the app only ever sees this, never the GitHub token.
    const token = jwt.sign(
      { sub: String(ghUser.id), username: ghUser.login, avatarUrl: ghUser.avatar_url },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    const back = new URL(appRedirect);
    back.searchParams.set("token", token);
    res.redirect(back.toString());
  } catch (err) {
    console.error(err);
    res.status(500).send("Auth failed");
  }
});

/** Step 3 — the app validates its JWT and gets the profile. */
app.get("/auth/me", (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ username: payload.username, avatarUrl: payload.avatarUrl });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.listen(PORT, "0.0.0.0", () => console.log(`Cliper auth server on http://0.0.0.0:${PORT}`));
