import type { Category } from '@/types';

export const CATEGORIES: Category[] = ['Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Other'];

export interface CategoryMeta {
  label: Category;
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  color: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  Food: { label: 'Food', icon: 'fast-food-outline', color: '#C98A47' },
  Travel: { label: 'Travel', icon: 'airplane-outline', color: '#5E8CA8' },
  Shopping: { label: 'Shopping', icon: 'bag-handle-outline', color: '#8A7BAE' },
  Bills: { label: 'Bills', icon: 'receipt-outline', color: '#B0705F' },
  Health: { label: 'Health', icon: 'medkit-outline', color: '#5E9B7B' },
  Other: { label: 'Other', icon: 'ellipsis-horizontal-circle-outline', color: '#7C8798' },
};
