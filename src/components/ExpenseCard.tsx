import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Expense } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: (expense: Expense) => void;
}

export function ExpenseCard({ expense, onPress }: ExpenseCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(expense)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={styles.body}>
        <View style={styles.row}>
          <Text numberOfLines={1} style={[styles.title, { color: theme.text }]}>
            {expense.title}
          </Text>
          <Text style={[styles.amount, { color: theme.text }]}>{formatCurrency(expense.amount)}</Text>
        </View>
        <View style={styles.row}>
          <CategoryBadge category={expense.category} />
          <Text style={[styles.date, { color: theme.textSecondary }]}>{formatDate(expense.date)}</Text>
        </View>
        {expense.note ? (
          <Text numberOfLines={1} style={[styles.note, { color: theme.textSecondary }]}>
            {expense.note}
          </Text>
        ) : null}
      </View>
      <Ionicons color={theme.textSecondary} name="chevron-forward" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
  },
  body: {
    flex: 1,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  date: {
    fontSize: 13,
  },
  note: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});
