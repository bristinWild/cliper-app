const supabase = require("../lib/supabase");

module.exports = async function githubAuth(req, res, next) {
    const header = req.headers.authorization || "";

    const token = header.startsWith("Bearer ")
        ? header.slice(7)
        : null;

    if (!token) {
        return res.status(401).json({
            error: "Missing GitHub token",
        });
    }

    try {
        const githubRes = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${token}`,
                "User-Agent": "cliper",
                Accept: "application/vnd.github+json",
            },
        });

        const githubUser = await githubRes.json();

        console.log("GitHub ID:", githubUser.id);
        console.log("GitHub Login:", githubUser.login);

        if (!githubRes.ok) {
            return res.status(401).json({
                error: "Invalid GitHub token",
            });
        }

        // Try to find existing user
        let { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("github_id", String(githubUser.id))
            .single();

        // Create user if it doesn't exist
        if (!user) {
            const result = await supabase
                .from("users")
                .insert({
                    github_id: String(githubUser.id),
                    username: githubUser.login,
                    avatar_url: githubUser.avatar_url,
                })
                .select()
                .single();

            if (result.error) {
                console.error(result.error);

                return res.status(500).json({
                    error: "Failed to create user",
                });
            }

            user = result.data;
        }

        req.user = user;
        req.github = githubUser;

        next();

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: "Authentication failed",
        });
    }
};