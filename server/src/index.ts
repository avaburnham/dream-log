console.log("Booting up...");

import express from 'express';

const app = express();
const PORT = 4000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Dream Log backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});


import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
