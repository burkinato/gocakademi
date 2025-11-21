import express from 'express';
import cors from 'cors';
import { env } from './core/config/env.js';

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Not found' });
});

export default app;
