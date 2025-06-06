"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_fetch_1 = __importDefault(require("node-fetch"));
const router = (0, express_1.Router)();
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
// @ts-ignore
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { text } = req.body;
    if (!text)
        return res.status(400).json({ error: 'No dream text provided.' });
    const endpoint = 'https://api-inference.huggingface.co/models/facebook/bart-large-mnli';
    const candidate_labels = [
        "happy",
        "sad",
        "fear",
        "excited",
        "peaceful",
        "confused",
        "angry"
    ];
    try {
        const hfRes = yield (0, node_fetch_1.default)(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: text,
                parameters: { candidate_labels }
            })
        });
        // Use "any" type for the result to silence TS complaints
        const result = yield hfRes.json();
        if (result && result.labels && result.scores) {
            res.json(result);
        }
        else if (result.error) {
            res.status(500).json({ error: result.error });
        }
        else {
            res.status(500).json({ error: "No analysis received." });
        }
    }
    catch (err) {
        console.error('[POST /analyze-hf] Error:', err);
        res.status(500).json({ error: "Failed to analyze dream." });
    }
}));
exports.default = router;
