import { Ionicons } from '@expo/vector-icons';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Radius, Spacing } from '@/constants/theme';
import { useSession } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { API_BASE_URL } from '@/services/api';

export default function ProfileScreen() {
  const theme = useTheme();
  const { session, signOut } = useSession();
  const user = session?.user;

  function confirmSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void signOut() },
    ]);
  }

  const initials = (user?.name ?? '?')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <Header subtitle="Account & settings" title="Profile" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={[styles.avatarText, { color: theme.primaryText }]}>{initials}</Text>
          </View>
          <Text style={[styles.name, { color: theme.text }]}>{user?.name ?? 'Unknown user'}</Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email ?? ''}</Text>
        </Card>

        <Card style={styles.infoCard}>
          <InfoRow icon="server-outline" label="API endpoint" theme={theme} value={API_BASE_URL} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <InfoRow icon="shield-checkmark-outline" label="Session storage" theme={theme} value="Expo SecureStore (encrypted)" />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <InfoRow icon="pricetag-outline" label="Currency" theme={theme} value="INR (₹)" />
        </Card>

        <Button icon="log-out-outline" label="Sign out" onPress={confirmSignOut} variant="danger" />

        <Text style={[styles.footnote, { color: theme.textSecondary }]}>
          Every expense you create is scoped to your account on the server. Signing out clears the
          stored token from this device.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons color={theme.textSecondary} name={icon} size={20} />
      <View style={styles.infoText}>
        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{label}</Text>
        <Text style={{ color: theme.text, fontSize: 15, fontWeight: '600' }}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  profileCard: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  email: {
    fontSize: 14,
  },
  infoCard: {
    gap: Spacing.two,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  infoText: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
