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
const supabase = require("./lib/supabase");
const auth = require("./middleware/auth");
const githubAuth = require("./middleware/githubAuth");
const http = require("http");
const { WebSocketServer } = require("ws");
const { encrypt, decrypt } = require("./lib/crypto");
const cors = require("cors");

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
app.use(cors());

app.use(express.json());

app.use((req, _res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});

// state -> app deep link, so the callback knows where to send the user back.
// In-memory is fine for dev; use Redis/DB with TTL in production.
const pendingStates = new Map();
const agentsOnline = new Map();


// Only ever redirect back into our own apps (mobile deep links + allowlisted web origins).
function isAllowedRedirect(url) {
  if (typeof url !== "string") return false;

  // Mobile: Expo Go + dev/prod builds — unchanged behavior
  if (url.startsWith("cliper://") || url.startsWith("exp://")) return true;

  // Web app: only explicitly allowlisted origins
  try {
    const u = new URL(url);
    const allowed = (process.env.WEB_APP_ORIGINS ?? "http://localhost:5500,http://127.0.0.1:5500,http://127.0.0.1:4000,http://localhost:4000")
      .split(",")
      .map((s) => s.trim());
    return (
      (u.protocol === "http:" || u.protocol === "https:") &&
      allowed.some((origin) => url.startsWith(origin))
    );
  } catch {
    return false;
  }
}


app.use(express.json());

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
  authorize.searchParams.set(
    "scope",
    "read:user public_repo read:org"
  );
  res.redirect(authorize.toString());
});

/** Step 2 — GitHub sends the user here; we exchange code for a token server-side. */
app.get("/auth/github/callback", async (req, res) => {
  const { code, state } = req.query;

  const appRedirect = pendingStates.get(state);
  pendingStates.delete(state);

  if (!appRedirect || !code) {
    return res.status(400).send("Invalid or expired OAuth state");
  }

  try {

    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
        }),
      }
    );

    const { access_token } = await tokenRes.json();

    if (!access_token) {
      return res.status(401).send("GitHub token exchange failed");
    }

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "User-Agent": "cliper",
      },
    });

    const ghUser = await userRes.json();

    if (!userRes.ok) {
      console.error(ghUser);
      return res.status(401).send("Failed to fetch GitHub profile");
    }

    if (!ghUser.id || !ghUser.login) {
      return res.status(500).send("Invalid GitHub profile");
    }

    const { data: user, error } = await supabase
      .from("users")
      .upsert(
        {
          github_id: String(ghUser.id),
          username: ghUser.login,
          avatar_url: ghUser.avatar_url,
          github_access_token: encrypt(access_token),
        },
        {
          onConflict: "github_id",
        }
      )
      .select()
      .single();

    if (error || !user) {
      console.error("Supabase error:", error);
      return res.status(500).send("Failed to save user");
    }

    const token = jwt.sign(
      {
        sub: user.id,
        githubId: String(ghUser.id),
        username: user.username,
        avatarUrl: user.avatar_url,
      },
      JWT_SECRET,
      {
        expiresIn: "30d",
        issuer: "cliper",
      }
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
app.get("/auth/me", auth, (req, res) => {
  res.json({
    username: req.user.username,
    avatarUrl: req.user.avatarUrl,
  });
});


app.post("/repositories/register", githubAuth, async (req, res) => {

  console.log("REGISTER REQUEST");
  console.log(req.user);
  console.log(req.body);

  const { name,
    githubOwner,
    githubRepo,
    branch,
    dataset } = req.body;

  const { data, error } = await supabase
    .from("repositories")
    .upsert(
      {
        user_id: req.user.id,
        name,
        github_owner: githubOwner,
        github_repo: githubRepo,
        branch,
        cognee_dataset: dataset,
        status: "registered",
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,github_owner,github_repo",
      }
    )
    .select()
    .single();

  console.log("Supabase response:");
  console.log(data);
  console.log(error);

  if (error) {
    return res.status(500).json(error);
  }

  res.json(data);

});

app.get("/repositories", auth, async (req, res) => {
  const { data, error } = await supabase
    .from("repositories")
    .select("id, name, github_owner, github_repo, branch, status, cognee_dataset, updated_at")
    .eq("user_id", req.user.sub)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: "Failed to load repositories" });
  }

  const online = agentsOnline.has(req.user.sub);
  res.json(data.map((r) => ({ ...r, agent_online: online })));
});

/** CLI auth: verify GitHub token, create/find the user, return the profile. */
app.post("/auth/cli", githubAuth, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    avatarUrl: req.user.avatar_url,
  });
});

/** Ask a question against a repository's Cognee memory. */
app.post("/repositories/:id/chat", auth, async (req, res) => {
  const { question } = req.body;
  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Missing question" });
  }

  // Get repo + user's Cognee credentials in one go
  const { data: repo, error } = await supabase
    .from("repositories")
    .select("id, cognee_dataset")
    .eq("id", req.params.id)
    .eq("user_id", req.user.sub)
    .single();

  if (error || !repo) {
    return res.status(404).json({ error: "Repository not found" });
  }

  const { data: user } = await supabase
    .from("users")
    .select("cognee_base_url, cognee_api_key")
    .eq("id", req.user.sub)
    .single();

  if (!user?.cognee_base_url || !user?.cognee_api_key) {
    return res.status(400).json({ error: "Cognee not configured. Run: cliper auth cognee" });
  }

  const cogneeBaseUrl = user.cognee_base_url;
  const cogneeApiKey = decrypt(user.cognee_api_key);

  try {
    const started = Date.now();
    const cogneeRes = await fetch(`${cogneeBaseUrl}/api/v1/search`, {
      method: "POST",
      headers: {
        "X-Api-Key": cogneeApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: question,
        search_type: "GRAPH_COMPLETION",
        datasets: [repo.cognee_dataset],
      }),
    });

    if (!cogneeRes.ok) {
      const body = await cogneeRes.text();
      console.error("Cognee search failed:", cogneeRes.status, body);
      return res.status(502).json({ error: "Memory search failed" });
    }

    const results = await cogneeRes.json();
    const answer = (results ?? [])
      .flatMap((r) => r.search_result ?? [])
      .join("\n\n")
      .trim();

    res.json({
      answer: answer || "I couldn't find anything about that in this repository's memory.",
      references: [],
      latencyMs: Date.now() - started,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chat failed" });
  }
});



const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

// user_id -> { agents, connectedAt }  (in-memory presence, fine for demo)


wss.on("connection", async (ws, req) => {
  // Authenticate the agent with its GitHub token (same as githubAuth)
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return ws.close(4001, "Missing token");

  try {
    const ghRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}`, "User-Agent": "cliper" },
    });
    if (!ghRes.ok) return ws.close(4001, "Invalid token");
    const ghUser = await ghRes.json();

    const { data: user } = await supabase
      .from("users")
      .select("id, username")
      .eq("github_id", String(ghUser.id))
      .single();
    if (!user) return ws.close(4001, "Unknown user");

    console.log(`Agent connected: ${user.username}`);

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "agent:register") {
          agentsOnline.set(user.id, { agents: msg.agents ?? [], connectedAt: Date.now() });
          console.log(`Agent registered for ${user.username}:`, msg.agents);
        }
      } catch { /* ignore */ }
    });

    ws.on("close", () => {
      agentsOnline.delete(user.id);
      console.log(`Agent disconnected: ${user.username}`);
    });
  } catch (err) {
    console.error(err);
    ws.close(1011, "Auth failed");
  }
});

/** Store user's Cognee credentials (from cliper auth cognee). */
app.post("/auth/cognee", githubAuth, async (req, res) => {
  const { baseUrl, apiKey } = req.body;
  if (!baseUrl || !apiKey) {
    return res.status(400).json({ error: "Missing baseUrl or apiKey" });
  }

  try {
    const { error } = await supabase
      .from("users")
      .update({
        cognee_base_url: baseUrl,
        cognee_api_key: encrypt(apiKey),
      })
      .eq("id", req.user.id);

    if (error) return res.status(500).json({ error: "Failed to save" });
    res.json({ ok: true });
  } catch (err) {
    console.error("Cognee credential save failed:", err.message);
    res.status(500).json({ error: "Server encryption not configured" });
  }
});

server.listen(PORT, () =>
  console.log(`Cliper server (http + ws) on port ${PORT}`)
);


