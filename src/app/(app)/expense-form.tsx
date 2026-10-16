import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { StateView } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { TextField } from '@/components/ui/TextField';
import { CATEGORIES, CATEGORY_META } from '@/constants/categories';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/services/api';
import { createExpense, deleteExpense, getExpense, updateExpense } from '@/services/expenses';
import type { Category } from '@/types';
import { formatDate, parseDateKey, toDateKey } from '@/utils/format';

export default function ExpenseFormScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const [errors, setErrors] = useState<{ title?: string; amount?: string; form?: string }>({});
  const [isLoading, setIsLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setIsLoading(true);
    getExpense(id)
      .then((expense) => {
        if (!active) return;
        setTitle(expense.title);
        setAmount(String(expense.amount));
        setCategory(expense.category);
        setDate(parseDateKey(expense.date));
        setNote(expense.note ?? '');
        setLoadError(null);
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(error instanceof ApiError ? error.message : 'Could not load this expense.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function handleSave() {
    const nextErrors: typeof errors = {};
    const trimmedTitle = title.trim();
    const numericAmount = Number(amount.replace(',', '.'));

    if (trimmedTitle.length === 0) nextErrors.title = 'Title is required';
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      nextErrors.amount = 'Amount must be greater than 0';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setBusy(true);
    const payload = {
      title: trimmedTitle,
      amount: numericAmount,
      category,
      date: toDateKey(date),
      note: note.trim() || undefined,
    };

    try {
      if (isEditing && id) {
        await updateExpense(id, payload);
      } else {
        await createExpense(payload);
      }
      router.back();
    } catch (error) {
      setErrors({
        form: error instanceof ApiError ? error.message : 'Could not save the expense.',
      });
    } finally {
      setBusy(false);
    }
  }

  function handleDelete() {
    if (!id) return;
    Alert.alert('Delete expense', 'This action cannot be undone. Delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await deleteExpense(id);
            router.back();
          } catch (error) {
            setErrors({
              form: error instanceof ApiError ? error.message : 'Could not delete the expense.',
            });
            setBusy(false);
          }
        },
      },
    ]);
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <Header showBack title="Edit expense" />
        <StateView icon="hourglass-outline" title="Loading…" />
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <Header showBack title="Edit expense" />
        <StateView
          action={<Button label="Go back" onPress={() => router.back()} />}
          icon="alert-circle-outline"
          message={loadError}
          title="Couldn't load expense"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <Header showBack subtitle={isEditing ? formatDate(toDateKey(date)) : 'New transaction'} title={isEditing ? 'Edit expense' : 'Add expense'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <TextField
            label="Title"
            onChangeText={setTitle}
            placeholder="e.g. Lunch with team"
            value={title}
            error={errors.title}
          />

          <TextField
            keyboardType="decimal-pad"
            label="Amount (₹)"
            onChangeText={setAmount}
            placeholder="0.00"
            value={amount}
            error={errors.amount}
          />

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((item) => {
                const meta = CATEGORY_META[item];
                const active = category === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setCategory(item)}
                    style={[
                      styles.categoryOption,
                      {
                        backgroundColor: active ? `${meta.color}22` : theme.card,
                        borderColor: active ? meta.color : theme.border,
                      },
                    ]}>
                    <Ionicons color={active ? meta.color : theme.textSecondary} name={meta.icon} size={18} />
                    <Text style={{ color: active ? meta.color : theme.text, fontWeight: '600', fontSize: 13 }}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Date</Text>
            <Pressable
              onPress={() => setShowPicker((prev) => !prev)}
              style={[styles.dateButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons color={theme.textSecondary} name="calendar-outline" size={18} />
              <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>{formatDate(toDateKey(date))}</Text>
              <Ionicons color={theme.textSecondary} name="chevron-down" size={18} />
            </Pressable>
            {showPicker ? (
              <View style={[styles.pickerBox, { borderColor: theme.border }]}>
                <DateTimePicker
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  mode="date"
                  onChange={(event, selected) => {
                    if (Platform.OS === 'android') setShowPicker(false);
                    if (event.type !== 'dismissed' && selected) setDate(selected);
                  }}
                  value={date}
                />
                {Platform.OS === 'ios' ? (
                  <Button label="Done" onPress={() => setShowPicker(false)} variant="secondary" />
                ) : null}
              </View>
            ) : null}
          </View>

          <TextField
            label="Note (optional)"
            multiline
            numberOfLines={3}
            onChangeText={setNote}
            placeholder="Add a short note"
            style={styles.noteInput}
            value={note}
          />

          {errors.form ? (
            <View style={[styles.formError, { backgroundColor: `${theme.danger}18` }]}>
              <Ionicons color={theme.danger} name="alert-circle-outline" size={18} />
              <Text style={{ color: theme.danger, flex: 1, fontSize: 14 }}>{errors.form}</Text>
            </View>
          ) : null}

          <Button
            icon="checkmark-circle-outline"
            label={isEditing ? 'Save changes' : 'Add expense'}
            loading={busy}
            onPress={handleSave}
          />

          {isEditing ? (
            <Button icon="trash-outline" label="Delete expense" onPress={handleDelete} variant="ghost" />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  field: { gap: Spacing.two },
  label: { fontSize: 13, fontWeight: '600' },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    minHeight: 50,
  },
  pickerBox: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.two,
    gap: Spacing.two,
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 12,
  },
});
