import express, { Request, Response } from "express";
import CodeBlock from "../models/codeblock_model";

const router = express.Router();

// GET /api/codeblocks
// Fetch all code blocks from the database
router.get("/", async (req, res) => {
  try {
    const blocks = await CodeBlock.find();
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch code blocks" });
  }
});

// GET /api/codeblocks/:id
// Fetch a single code block by its ID
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const block = await CodeBlock.findById(req.params.id);
    if (!block) {
      res.status(404).json({ error: "Not found" });
    }
    res.json(block);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch code block" });
  }
});
export default router;
