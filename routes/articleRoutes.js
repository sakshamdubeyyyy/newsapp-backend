const express = require("express");

module.exports = function (db) {
  const router = express.Router();

  // ✅ CREATE an article
  router.post("/", async (req, res) => {
    const { title, body } = req.body;
    const userId = req.session?.user?.userId;

    if (!userId) return res.status(401).send("Unauthorized");

    try {
      await db.none(
        "INSERT INTO articles(title, body, userId) VALUES($1, $2, $3)",
        [title, body, userId]
      );
      res.status(201).send("Article created successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  });

  // ✅ READ all articles
  router.get("/", async (req, res) => {
    try {
      const articles = await db.any("SELECT * FROM articles ORDER BY id DESC");
      res.status(200).json(articles);
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to fetch articles");
    }
  });

  // ✅ READ single article by ID
  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const article = await db.oneOrNone(
        "SELECT * FROM articles WHERE id = $1",
        [id]
      );
      if (!article) return res.status(404).send("Article not found");
      res.json(article);
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to fetch the article");
    }
  });

  // ✅ UPDATE an article by ID (only owner)
  router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { title, body } = req.body;
    const userId = req.session?.user?.userId;

    if (!userId) return res.status(401).send("Unauthorized");

    try {
      const result = await db.result(
        "UPDATE articles SET title = $1, body = $2 WHERE id = $3 AND userId = $4",
        [title, body, id, userId]
      );

      if (result.rowCount === 0)
        return res.status(403).send("Forbidden or Article not found");
      res.send("Article updated successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to update the article");
    }
  });

  // ✅ DELETE an article by ID (only owner)
  router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const userId = req.session?.user?.userId;

    if (!userId) return res.status(401).send("Unauthorized");

    try {
      const result = await db.result(
        "DELETE FROM articles WHERE id = $1 AND userId = $2",
        [id, userId]
      );

      if (result.rowCount === 0)
        return res.status(403).send("Forbidden or Article not found");
      res.send("Article deleted successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to delete the article");
    }
  });

  return router;
};
