import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card, StateView } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { CATEGORY_META } from '@/constants/categories';
import { Radius, Spacing } from '@/constants/theme';
import { useSession } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { useExpenses } from '@/hooks/use-expenses';
import { listExpenses } from '@/services/expenses';
import type { Category } from '@/types';
import { formatCurrency, monthRange } from '@/utils/format';

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session } = useSession();
  const { label } = useMemo(() => monthRange(), []);

  const load = useCallback((signal: AbortSignal) => {
    const { from, to } = monthRange();
    return listExpenses({ from, to }, signal);
  }, []);

  const { expenses, isLoading, isRefreshing, error, refresh, retry } = useExpenses(load, [label]);

  const total = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
  );

  const byCategory = useMemo(() => {
    const map = new Map<Category, number>();
    for (const expense of expenses) {
      map.set(expense.category, (map.get(expense.category) ?? 0) + expense.amount);
    }
    return [...map.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const firstName = session?.user.name?.split(' ')[0] ?? 'there';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl onRefresh={refresh} refreshing={isRefreshing} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}>
        <Header subtitle={`${label} overview`} title={`Hi, ${firstName}`} />

        {error && expenses.length === 0 ? (
          <StateView
            action={<Button label="Retry" onPress={retry} />}
            icon="cloud-offline-outline"
            message={error}
            title="Couldn't load your dashboard"
          />
        ) : (
          <>
            <Card style={styles.totalCard}>
              <View style={styles.totalTop}>
                <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
                  Total spent this month
                </Text>
                <View style={[styles.totalIcon, { backgroundColor: `${theme.primary}1F` }]}>
                  <Ionicons color={theme.primary} name="wallet-outline" size={18} />
                </View>
              </View>
              <Text style={[styles.totalAmount, { color: theme.text }]}>{formatCurrency(total)}</Text>
              <View style={styles.totalMeta}>
                <Ionicons color={theme.textSecondary} name="receipt-outline" size={16} />
                <Text style={[styles.totalMetaText, { color: theme.textSecondary }]}>
                  {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
                </Text>
              </View>
            </Card>

            <Button
              icon="add-circle-outline"
              label="Add expense"
              onPress={() => router.push('/expense-form')}
            />

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Spending by category</Text>
              {isLoading ? (
                <Text style={[styles.placeholder, { color: theme.textSecondary }]}>Loading…</Text>
              ) : byCategory.length === 0 ? (
                <Card>
                  <Text style={[styles.placeholder, { color: theme.textSecondary }]}>
                    No expenses yet this month. Add your first one to see a breakdown.
                  </Text>
                </Card>
              ) : (
                <View style={styles.categoryList}>
                  {byCategory.map(({ category, amount }) => {
                    const meta = CATEGORY_META[category];
                    const share = total > 0 ? amount / total : 0;
                    return (
                      <Card key={category} style={styles.categoryRow}>
                        <View style={styles.categoryHeader}>
                          <View style={styles.categoryName}>
                            <View style={[styles.dot, { backgroundColor: meta.color }]}>
                              <Ionicons color="#FFFFFF" name={meta.icon} size={14} />
                            </View>
                            <Text style={[styles.categoryLabel, { color: theme.text }]}>{meta.label}</Text>
                          </View>
                          <Text style={[styles.categoryAmount, { color: theme.text }]}>
                            {formatCurrency(amount)}
                          </Text>
                        </View>
                        <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
                          <View
                            style={[
                              styles.fill,
                              { backgroundColor: meta.color, width: `${Math.max(share * 100, 3)}%` },
                            ]}
                          />
                        </View>
                        <Text style={[styles.share, { color: theme.textSecondary }]}>
                          {Math.round(share * 100)}% of spending
                        </Text>
                      </Card>
                    );
                  })}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  totalCard: {
    gap: Spacing.two,
    padding: Spacing.four,
  },
  totalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalAmount: {
    fontSize: 34,
    fontWeight: '800',
  },
  totalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  totalMetaText: {
    fontSize: 14,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    fontSize: 14,
    lineHeight: 20,
  },
  categoryList: {
    gap: Spacing.two,
  },
  categoryRow: {
    gap: Spacing.two,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  track: {
    height: 8,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: Radius.pill,
  },
  share: {
    fontSize: 12,
  },
});
