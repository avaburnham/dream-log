import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import analyzeHuggingFaceRouter from './routes/analyzeHuggingFace';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'; // Put a real secret in your .env!

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/analyze-hf', analyzeHuggingFaceRouter);

// Middleware to check JWT and add user to req
function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
      (req as any).user = payload; // attach user info
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
  }
  return res.status(401).json({ error: 'No token provided.' });
}

// Health check/root route
app.get('/', (_req, res) => {
  res.send('Dream Log backend is running!');
});

// ====================
// User Registration API (POST /register)
// ====================
// @ts-ignore
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    res.status(201).json({ id: user.id, email: user.email });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Email already in use.' });
    } else {
      console.error('[POST /register] Error:', error);
      res.status(500).json({ error: 'Failed to create user.' });
    }
  }
});

// (Optional) Legacy: User Signup (same as register)
// @ts-ignore
app.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    res.status(201).json({ id: user.id, email: user.email });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Email already in use.' });
    } else {
      console.error('[POST /signup] Error:', error);
      res.status(500).json({ error: 'Failed to create user.' });
    }
  }
});

// Create a new dream (must include userId)
// @ts-ignore
// Create a new dream for the authenticated user
app.post('/dreams', authenticateJWT, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Dream text is required.' });
    }
    const dream = await prisma.dream.create({
      data: { text, userId: Number(userId) },
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
  } catch (error: any) {
    console.error('[DELETE /dreams/:id] Error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Dream not found' });
    }
    res.status(500).json({ error: 'Failed to delete dream' });
  }
});

// Get all dreams for a specific user in descending order
// @ts-ignore
// Get all dreams for the authenticated user
app.get('/dreams', authenticateJWT, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const dreams = await prisma.dream.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: 'desc' },
    });
    res.json(dreams);
  } catch (error) {
    console.error('[GET /dreams] Error:', error);
    res.status(500).json({ error: 'Failed to fetch dreams' });
  }
});


// Login route
// @ts-ignore
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: 'Invalid email or password.' });

    // Generate a JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, userId: user.id, email: user.email });
  } catch (err) {
    console.error('[POST /login] Error:', err);
    res.status(500).json({ error: 'Failed to log in.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
