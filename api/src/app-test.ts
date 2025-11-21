import express from 'express';
import cors from 'express';
import { env } from './core/config/env.js';
import authRoutes from './api/routes/auth.js';

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Test auth route
app.use('/api/auth', authRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Not found' });
});

export default app;
