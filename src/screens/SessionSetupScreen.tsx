import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Button from '../components/Button';
import Chip from '../components/Chip';
import type { ScreenProps } from '../navigation';
import { loadPeople } from '../storage';
import { useTheme } from '../theme';
import type { Person } from '../types';

export default function SessionSetupScreen({
  navigation,
}: ScreenProps<'SessionSetup'>) {
  const c = useTheme();
  const [people, setPeople] = useState<Person[]>([]);
  const [group, setGroup] = useState<string | null>(null); // null = everyone

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      loadPeople().then((p) => alive && setPeople(p));
      return () => {
        alive = false;
      };
    }, [])
  );

  const groups = useMemo(() => {
    const set = new Set<string>();
    people.forEach((p) => p.groups.forEach((g) => set.add(g)));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [people]);

  const count = useMemo(
    () =>
      group ? people.filter((p) => p.groups.includes(group)).length : people.length,
    [people, group]
  );

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.label, { color: c.inkSoft }]}>Who to include</Text>
        <View style={styles.chipWrap}>
          <Chip
            label="Everyone"
            selected={group === null}
            onPress={() => setGroup(null)}
          />
          {groups.map((g) => (
            <Chip
              key={g}
              label={g}
              selected={group === g}
              onPress={() => setGroup(g)}
            />
          ))}
        </View>

        <View
          style={[
            styles.info,
            { backgroundColor: c.surface2, borderColor: c.line },
          ]}
        >
          <Text style={[styles.infoText, { color: c.inkSoft }]}>
            🔀 Each card shows a random face, name, or note — you (or a friend
            holding the phone) guess the rest out loud, then reveal to check.
          </Text>
        </View>

        <Text style={[styles.count, { color: c.ink }]}>
          {count} {count === 1 ? 'person' : 'people'} in this session
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Start session"
          disabled={count === 0}
          onPress={() => navigation.navigate('Play', { group })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  info: {
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  infoText: { fontSize: 15, lineHeight: 22 },
  count: { fontSize: 16, fontWeight: '600', marginTop: 24 },
  footer: { padding: 16 },
});
