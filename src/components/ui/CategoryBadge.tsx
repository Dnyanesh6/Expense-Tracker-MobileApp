import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { CATEGORY_META } from '@/constants/categories';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Category } from '@/types';

export function CategoryBadge({ category, compact = false }: { category: Category; compact?: boolean }) {
  const theme = useTheme();
  const meta = CATEGORY_META[category];
  return (
    <View style={[styles.badge, { backgroundColor: `${meta.color}22` }]}>
      <Ionicons color={meta.color} name={meta.icon} size={compact ? 13 : 15} />
      {!compact ? <Text style={[styles.label, { color: meta.color }]}>{meta.label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
