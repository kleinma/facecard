import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '../theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** When set, the chip shows a ✕ and tapping it removes the tag. */
  onRemove?: () => void;
};

/** A small pill for groups and filters. */
export default function Chip({ label, selected, onPress, onRemove }: Props) {
  const c = useTheme();
  const interactive = !!(onRemove || onPress);
  return (
    <Pressable
      onPress={onRemove ?? onPress}
      accessibilityRole={interactive ? 'button' : 'text'}
      accessibilityLabel={onRemove ? `${label}, remove` : label}
      accessibilityState={selected ? { selected: true } : undefined}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? c.accent : c.surface2,
          borderColor: selected ? c.accent : c.line,
        },
      ]}
    >
      <Text style={[styles.text, { color: selected ? c.onAccent : c.inkSoft }]}>
        {label}
        {onRemove ? '  ✕' : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: { fontSize: 13, fontWeight: '600' },
});
