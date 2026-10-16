import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Router } from 'express';

import { requireAuth, signToken } from '../auth';
import { db, type UserRecord } from '../store';
import { isValidEmail } from '../validate';

const router = Router();

function publicUser(user: UserRecord) {
  return { id: user.id, name: user.name, email: user.email };
}

router.post('/register', async (req, res) => {
  const { name, email, password } = (req.body ?? {}) as Record<string, unknown>;

  if (typeof name !== 'string' || name.trim().length < 2) {
    res.status(400).json({ error: 'Name must be at least 2 characters long' });
    return;
  }
  if (typeof email !== 'string' || !isValidEmail(email.trim())) {
    res.status(400).json({ error: 'Please enter a valid email address' });
    return;
  }
  if (typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (db.users.some((user) => user.email === normalizedEmail)) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const user: UserRecord = {
    id: randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 10),
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  db.save();

  const token = signToken({ sub: user.id, email: user.email });
  res.status(201).json({ token, user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = (req.body ?? {}) as Record<string, unknown>;

  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.users.find((candidate) => candidate.email === email.trim().toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = signToken({ sub: user.id, email: user.email });
  res.json({ token, user: publicUser(user) });
});

router.get('/me', requireAuth, (req, res) => {
  const user = db.users.find((candidate) => candidate.id === req.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user: publicUser(user) });
});

export default router;
