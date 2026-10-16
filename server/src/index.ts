import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';

import authRoutes from './routes/auth';
import expenseRoutes from './routes/expenses';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'expense-tracker-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : 'Unexpected server error';
  console.error('[server]', message);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = Number(process.env.PORT ?? 4000);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Expense Tracker API listening on http://0.0.0.0:${PORT}`);
});
