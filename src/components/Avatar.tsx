import { Image, StyleSheet, Text, View } from 'react-native';

import { colorForName, initials } from '../utils';

type Props = {
  name: string;
  photo?: string;
  size?: number;
  rounded?: boolean;
};

/** A person's photo, or a colored circle with their initials if there's none. */
export default function Avatar({ name, photo, size = 56, rounded = true }: Props) {
  const radius = rounded ? size / 2 : Math.round(size * 0.22);
  if (photo) {
    return (
      <Image
        source={{ uri: photo }}
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  }
  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: colorForName(name),
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontWeight: '700' },
});
