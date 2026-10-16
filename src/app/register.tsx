import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/services/api';
import { isValidEmail } from '@/utils/validation';

export default function RegisterScreen() {
  const theme = useTheme();
  const { signUp } = useSession();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    form?: string;
  }>({});
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    const nextErrors: typeof errors = {};
    if (name.trim().length < 2) nextErrors.name = 'Name must be at least 2 characters';
    if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email address';
    if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setBusy(true);
    try {
      await signUp(name.trim(), email.trim(), password);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Unable to create account. Please try again.';
      setErrors({ form: message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.brand}>
            <View style={[styles.logo, { backgroundColor: theme.primary }]}>
              <Ionicons color={theme.primaryText} name="person-add" size={28} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Create account</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Start tracking your spending in seconds
            </Text>
          </View>

          <View style={styles.form}>
            <TextField
              autoCapitalize="words"
              label="Full name"
              onChangeText={setName}
              placeholder="Jane Doe"
              value={name}
              error={errors.name}
            />
            <TextField
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              placeholder="you@example.com"
              value={email}
              error={errors.email}
            />
            <TextField
              label="Password"
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              secure
              value={password}
              error={errors.password}
            />

            {errors.form ? (
              <View style={[styles.formError, { backgroundColor: `${theme.danger}18` }]}>
                <Ionicons color={theme.danger} name="alert-circle-outline" size={18} />
                <Text style={[styles.formErrorText, { color: theme.danger }]}>{errors.form}</Text>
              </View>
            ) : null}

            <Button label="Create account" loading={busy} onPress={handleSubmit} />

            <View style={styles.switchRow}>
              <Text style={[styles.switchText, { color: theme.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <Link href="/login" style={[styles.link, { color: theme.primary }]}>
                Sign in
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.five,
  },
  brand: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  form: {
    gap: Spacing.three,
  },
  formError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 12,
  },
  formErrorText: {
    flex: 1,
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
  },
});
