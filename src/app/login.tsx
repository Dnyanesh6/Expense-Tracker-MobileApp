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

export default function LoginScreen() {
  const theme = useTheme();
  const { signIn } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    const nextErrors: typeof errors = {};
    if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email address';
    if (password.length === 0) nextErrors.password = 'Password is required';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setBusy(true);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Unable to sign in. Please try again.';
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
              <Ionicons color={theme.primaryText} name="wallet" size={30} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Sign in to track your daily expenses
            </Text>
          </View>

          <View style={styles.form}>
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
              placeholder="Enter your password"
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

            <Button label="Sign in" loading={busy} onPress={handleSubmit} />

            <View style={styles.switchRow}>
              <Text style={[styles.switchText, { color: theme.textSecondary }]}>
                Don&apos;t have an account?{' '}
              </Text>
              <Link href="/register" style={[styles.link, { color: theme.primary }]}>
                Create one
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
