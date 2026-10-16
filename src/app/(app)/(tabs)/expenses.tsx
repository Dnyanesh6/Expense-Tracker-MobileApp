import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ExpenseCard } from '@/components/ExpenseCard';
import { Button } from '@/components/ui/Button';
import { StateView } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { CATEGORIES, CATEGORY_META } from '@/constants/categories';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useExpenses } from '@/hooks/use-expenses';
import { listExpenses } from '@/services/expenses';
import type { Category } from '@/types';
import { formatCurrency, parseDateKey, toDateKey } from '@/utils/format';

type CategoryFilter = Category | 'All';
type DateField = 'from' | 'to';

export default function ExpensesScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [from, setFrom] = useState<string | undefined>();
  const [to, setTo] = useState<string | undefined>();
  const [picker, setPicker] = useState<DateField | null>(null);

  const load = useCallback(
    (signal: AbortSignal) =>
      listExpenses({ search: search.trim(), category, from, to }, signal),
    [search, category, from, to],
  );

  const { expenses, isLoading, isRefreshing, error, refresh, retry } = useExpenses(load, [
    search,
    category,
    from,
    to,
  ]);

  const total = useMemo(() => expenses.reduce((sum, item) => sum + item.amount, 0), [expenses]);
  const hasFilters = category !== 'All' || Boolean(from) || Boolean(to) || search.trim().length > 0;

  function resetFilters() {
    setSearch('');
    setCategory('All');
    setFrom(undefined);
    setTo(undefined);
  }

  function onPickDate(field: DateField, selected?: Date) {
    if (Platform.OS === 'android') setPicker(null);
    if (!selected) return;
    const key = toDateKey(selected);
    if (field === 'from') setFrom(key);
    else setTo(key);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <Header subtitle="Search, filter and manage" title="Expenses" />

      <View style={styles.controls}>
        <View style={[styles.search, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons color={theme.textSecondary} name="search" size={18} />
          <TextInput
            onChangeText={setSearch}
            placeholder="Search by title"
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text }]}
            value={search}
          />
          {search.length > 0 ? (
            <Pressable accessibilityLabel="Clear search" hitSlop={8} onPress={() => setSearch('')}>
              <Ionicons color={theme.textSecondary} name="close-circle" size={18} />
            </Pressable>
          ) : null}
        </View>

        <FlatList
          contentContainerStyle={styles.chips}
          data={['All', ...CATEGORIES] as CategoryFilter[]}
          horizontal
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const active = category === item;
            return (
              <Pressable
                onPress={() => setCategory(item)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? theme.primary : theme.card,
                    borderColor: active ? theme.primary : theme.border,
                  },
                ]}>
                <Text style={{ color: active ? theme.primaryText : theme.text, fontWeight: '600', fontSize: 13 }}>
                  {item}
                </Text>
              </Pressable>
            );
          }}
          showsHorizontalScrollIndicator={false}
        />

        <View style={styles.dateRow}>
          <DateFilterChip
            active={Boolean(from)}
            label={from ? parseDateKey(from).toLocaleDateString() : 'From date'}
            onClear={() => setFrom(undefined)}
            onPress={() => setPicker('from')}
          />
          <DateFilterChip
            active={Boolean(to)}
            label={to ? parseDateKey(to).toLocaleDateString() : 'To date'}
            onClear={() => setTo(undefined)}
            onPress={() => setPicker('to')}
          />
          {hasFilters ? (
            <Pressable onPress={resetFilters} style={styles.reset}>
              <Ionicons color={theme.primary} name="refresh" size={16} />
              <Text style={{ color: theme.primary, fontWeight: '600', fontSize: 13 }}>Reset</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {picker ? (
        <DateTimePicker
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          mode="date"
          onChange={(event, selected) => {
            if (event.type === 'dismissed') {
              setPicker(null);
              return;
            }
            onPickDate(picker, selected);
          }}
          value={parseDateKey((picker === 'from' ? from : to) ?? toDateKey(new Date()))}
        />
      ) : null}

      {isLoading && expenses.length === 0 ? (
        <StateView icon="hourglass-outline" title="Loading expenses…" />
      ) : error && expenses.length === 0 ? (
        <StateView
          action={<Button label="Retry" onPress={retry} />}
          icon="cloud-offline-outline"
          message={error}
          title="Couldn't load expenses"
        />
      ) : (
        <FlatList
          ListEmptyComponent={
            <StateView
              icon="receipt-outline"
              message={
                hasFilters
                  ? 'No expenses match your filters. Try adjusting them.'
                  : 'Tap "Add expense" to record your first expense.'
              }
              title={hasFilters ? 'No matching expenses' : 'No expenses yet'}
            />
          }
          ListFooterComponent={
            expenses.length > 0 ? (
              <View style={[styles.summary, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={{ color: theme.textSecondary, fontSize: 14 }}>Filtered total</Text>
                <Text style={{ color: theme.text, fontSize: 18, fontWeight: '800' }}>
                  {formatCurrency(total)}
                </Text>
              </View>
            ) : undefined
          }
          contentContainerStyle={styles.listContent}
          data={expenses}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl onRefresh={refresh} refreshing={isRefreshing} tintColor={theme.primary} />
          }
          renderItem={({ item }) => (
            <ExpenseCard
              expense={item}
              onPress={(expense) =>
                router.push({ pathname: '/expense-form', params: { id: expense.id } })
              }
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      <SafeAreaView edges={['bottom']} style={[styles.fabWrap, { backgroundColor: 'transparent' }]}>
        <Button icon="add" label="Add expense" onPress={() => router.push('/expense-form')} />
      </SafeAreaView>
    </SafeAreaView>
  );
}

function DateFilterChip({
  label,
  active,
  onPress,
  onClear,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  onClear: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.dateChip,
        { backgroundColor: theme.card, borderColor: active ? theme.primary : theme.border },
      ]}>
      <Ionicons color={active ? theme.primary : theme.textSecondary} name="calendar-outline" size={15} />
      <Text style={{ color: theme.text, fontSize: 13, fontWeight: '500' }}>{label}</Text>
      {active ? (
        <Pressable accessibilityLabel="Clear date" hitSlop={6} onPress={onClear}>
          <Ionicons color={theme.textSecondary} name="close" size={15} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  controls: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    minHeight: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: Spacing.two,
  },
  chips: {
    gap: Spacing.two,
    paddingRight: Spacing.three,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  reset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginLeft: 'auto',
  },
  listContent: {
    padding: Spacing.three,
    paddingBottom: 120,
    gap: Spacing.two,
    flexGrow: 1,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
    marginTop: Spacing.two,
  },
  fabWrap: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    bottom: Spacing.two,
  },
});
