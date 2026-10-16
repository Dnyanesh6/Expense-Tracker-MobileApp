import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Card({ style, children, ...rest }: ViewProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}

interface StateViewProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function StateView({ icon, title, message, action }: StateViewProps) {
  const theme = useTheme();
  return (
    <View style={styles.state}>
      <Ionicons color={theme.textSecondary} name={icon} size={44} />
      <Text style={[styles.stateTitle, { color: theme.text }]}>{title}</Text>
      {message ? <Text style={[styles.stateMessage, { color: theme.textSecondary }]}>{message}</Text> : null}
      {action ? <View style={styles.stateAction}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  stateMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  stateAction: {
    marginTop: Spacing.three,
    minWidth: 160,
  },
});
