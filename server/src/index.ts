import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
// import analyzeRouter from './routes/analyze';
import analyzeHuggingFaceRouter from './routes/analyzeHuggingFace';
import dotenv from 'dotenv';
dotenv.config();



const app = express();
const prisma = new PrismaClient();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/analyze-hf', analyzeHuggingFaceRouter);
// app.use('/analyze-hf', (req, res) => {
//   res.json({ msg: 'Minimal test route works' });
// });



// Health check/root route
app.get('/', (_req, res) => {
  res.send('Dream Log backend is running!');
});

// Create a new dream
// @ts-ignore
app.post('/dreams', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Dream text is required' });
    }
    const dream = await prisma.dream.create({
      data: { text },
    });
    res.status(201).json(dream);
  } catch (error) {
    console.error('[POST /dreams] Error:', error);
    res.status(500).json({ error: 'Failed to create dream' });
  }
});

// Delete a dream by ID
// @ts-ignore
app.delete('/dreams/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid dream ID' });
    }
    await prisma.dream.delete({ where: { id } });
    res.status(204).send();
  } catch (error: unknown) {
    console.error('[DELETE /dreams/:id] Error:', error);

    // Safely narrow the error
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as any).code === 'P2025'
    ) {
      // Prisma "Record not found"
      return res.status(404).json({ error: 'Dream not found' });
    }
    res.status(500).json({ error: 'Failed to delete dream' });
  }
});



// Get all dreams in descending order
app.get('/dreams', async (_req, res) => {
  try {
    const dreams = await prisma.dream.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(dreams);
  } catch (error) {
    console.error('[GET /dreams] Error:', error);
    res.status(500).json({ error: 'Failed to fetch dreams' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
