import { Router } from 'express';
import fetch from 'node-fetch';
const router = Router();

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

// @ts-ignore
router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No dream text provided.' });

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
    const hfRes = await fetch(endpoint, {
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
    const result: any = await hfRes.json();

    if (result && result.labels && result.scores) {
      res.json(result);
    } else if (result.error) {
      res.status(500).json({ error: result.error });
    } else {
      res.status(500).json({ error: "No analysis received." });
    }
  } catch (err) {
    console.error('[POST /analyze-hf] Error:', err);
    res.status(500).json({ error: "Failed to analyze dream." });
  }
});

export default router;