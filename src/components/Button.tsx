import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { useTheme } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  color?: string; // overrides the primary background (e.g. good / bad / amber)
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

/** The one button style used across the app. */
export default function Button({
  label,
  onPress,
  variant = 'primary',
  color,
  disabled,
  loading,
  style,
}: Props) {
  const c = useTheme();
  const isPrimary = variant === 'primary';
  const bg = isPrimary ? color ?? c.accent : 'transparent';
  const fg = isPrimary ? c.onAccent : c.accentInk;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor: isPrimary ? bg : c.line,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.label, { color: fg }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 16, fontWeight: '700' },
});
