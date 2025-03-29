"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const codeblock_model_1 = __importDefault(require("../models/codeblock_model"));
const router = express_1.default.Router();
// GET /api/codeblocks
// Fetch all code blocks from the database
router.get("/", async (req, res) => {
    try {
        const blocks = await codeblock_model_1.default.find();
        res.json(blocks);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch code blocks" });
    }
});
// GET /api/codeblocks/:id
// Fetch a single code block by its ID
router.get("/:id", async (req, res) => {
    try {
        const block = await codeblock_model_1.default.findById(req.params.id);
        if (!block) {
            res.status(404).json({ error: "Not found" });
        }
        res.json(block);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch code block" });
    }
});
exports.default = router;
