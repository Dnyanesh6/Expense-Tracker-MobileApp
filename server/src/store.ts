import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(currentDir, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface ExpenseRecord {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

interface Database {
  users: UserRecord[];
  expenses: ExpenseRecord[];
}

let cache: Database | null = null;

function load(): Database {
  if (cache) return cache;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) as Database;
      cache = {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      };
    } catch {
      cache = { users: [], expenses: [] };
    }
  } else {
    cache = { users: [], expenses: [] };
    persist();
  }

  return cache;
}

function persist(): void {
  if (!cache) return;
  fs.writeFileSync(DB_FILE, JSON.stringify(cache, null, 2), 'utf-8');
}

export const db = {
  get users(): UserRecord[] {
    return load().users;
  },
  get expenses(): ExpenseRecord[] {
    return load().expenses;
  },
  save(): void {
    persist();
  },
};
