import { randomUUID } from 'node:crypto';
import { Router } from 'express';

import { requireAuth } from '../auth';
import { db, type ExpenseRecord } from '../store';
import { validateExpense } from '../validate';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  const { category, from, to, search } = req.query as Record<string, string | undefined>;

  let items = db.expenses.filter((expense) => expense.userId === req.userId);

  if (category && category !== 'All') {
    items = items.filter((expense) => expense.category === category);
  }
  if (from) {
    items = items.filter((expense) => expense.date >= from);
  }
  if (to) {
    items = items.filter((expense) => expense.date <= to);
  }
  if (search) {
    const query = search.toLowerCase();
    items = items.filter((expense) => expense.title.toLowerCase().includes(query));
  }

  items = [...items].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  res.json({ expenses: items });
});

router.get('/:id', (req, res) => {
  const expense = db.expenses.find((item) => item.id === req.params.id && item.userId === req.userId);
  if (!expense) {
    res.status(404).json({ error: 'Expense not found' });
    return;
  }
  res.json({ expense });
});

router.post('/', (req, res) => {
  const { value, error } = validateExpense(req.body);
  if (error || !value) {
    res.status(400).json({ error });
    return;
  }

  const now = new Date().toISOString();
  const expense: ExpenseRecord = {
    id: randomUUID(),
    userId: req.userId!,
    ...value,
    createdAt: now,
    updatedAt: now,
  };

  db.expenses.push(expense);
  db.save();

  res.status(201).json({ expense });
});

router.put('/:id', (req, res) => {
  const expense = db.expenses.find((item) => item.id === req.params.id && item.userId === req.userId);
  if (!expense) {
    res.status(404).json({ error: 'Expense not found' });
    return;
  }

  const { value, error } = validateExpense(req.body);
  if (error || !value) {
    res.status(400).json({ error });
    return;
  }

  Object.assign(expense, value, { updatedAt: new Date().toISOString() });
  db.save();

  res.json({ expense });
});

router.delete('/:id', (req, res) => {
  const index = db.expenses.findIndex(
    (item) => item.id === req.params.id && item.userId === req.userId,
  );
  if (index === -1) {
    res.status(404).json({ error: 'Expense not found' });
    return;
  }

  db.expenses.splice(index, 1);
  db.save();

  res.json({ ok: true });
});

export default router;
