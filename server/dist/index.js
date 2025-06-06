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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const analyzeHuggingFace_1 = __importDefault(require("./routes/analyzeHuggingFace"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'; // Put a real secret in your .env!
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = 4000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/analyze-hf', analyzeHuggingFace_1.default);
// Middleware to check JWT and add user to req
function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        try {
            const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.user = payload; // attach user info
            return next();
        }
        catch (err) {
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
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Email and password required.' });
        // Check if user already exists
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists.' });
        }
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create user
        const user = yield prisma.user.create({
            data: { email, password: hashedPassword },
        });
        res.status(201).json({ id: user.id, email: user.email });
    }
    catch (error) {
        if (error.code === 'P2002') {
            res.status(409).json({ error: 'Email already in use.' });
        }
        else {
            console.error('[POST /register] Error:', error);
            res.status(500).json({ error: 'Failed to create user.' });
        }
    }
}));
// (Optional) Legacy: User Signup (same as register)
// @ts-ignore
app.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Email and password required.' });
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create user
        const user = yield prisma.user.create({
            data: { email, password: hashedPassword },
        });
        res.status(201).json({ id: user.id, email: user.email });
    }
    catch (error) {
        if (error.code === 'P2002') {
            res.status(409).json({ error: 'Email already in use.' });
        }
        else {
            console.error('[POST /signup] Error:', error);
            res.status(500).json({ error: 'Failed to create user.' });
        }
    }
}));
// Create a new dream (must include userId)
// @ts-ignore
// Create a new dream for the authenticated user
app.post('/dreams', authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Dream text is required.' });
        }
        const dream = yield prisma.dream.create({
            data: { text, userId: Number(userId) },
        });
        res.status(201).json(dream);
    }
    catch (error) {
        console.error('[POST /dreams] Error:', error);
        res.status(500).json({ error: 'Failed to create dream' });
    }
}));
// Delete a dream by ID
// @ts-ignore
app.delete('/dreams/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid dream ID' });
        }
        yield prisma.dream.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        console.error('[DELETE /dreams/:id] Error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Dream not found' });
        }
        res.status(500).json({ error: 'Failed to delete dream' });
    }
}));
// Get all dreams for a specific user in descending order
// @ts-ignore
// Get all dreams for the authenticated user
app.get('/dreams', authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const dreams = yield prisma.dream.findMany({
            where: { userId: Number(userId) },
            orderBy: { createdAt: 'desc' },
        });
        res.json(dreams);
    }
    catch (error) {
        console.error('[GET /dreams] Error:', error);
        res.status(500).json({ error: 'Failed to fetch dreams' });
    }
}));
// Login route
// @ts-ignore
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Email and password required.' });
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(401).json({ error: 'Invalid email or password.' });
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch)
            return res.status(401).json({ error: 'Invalid email or password.' });
        // Generate a JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, userId: user.id, email: user.email });
    }
    catch (err) {
        console.error('[POST /login] Error:', err);
        res.status(500).json({ error: 'Failed to log in.' });
    }
}));
// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
