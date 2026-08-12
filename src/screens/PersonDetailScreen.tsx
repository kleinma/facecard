import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Avatar from '../components/Avatar';
import Button from '../components/Button';
import Chip from '../components/Chip';
import type { ScreenProps } from '../navigation';
import { loadPeople } from '../storage';
import { useTheme } from '../theme';
import type { Person } from '../types';

export default function PersonDetailScreen({
  navigation,
  route,
}: ScreenProps<'PersonDetail'>) {
  const c = useTheme();
  const { id } = route.params;
  const [person, setPerson] = useState<Person | null>(null);
  const [missing, setMissing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      loadPeople().then((people) => {
        if (!alive) return;
        const p = people.find((x) => x.id === id) ?? null;
        setPerson(p);
        setMissing(!p);
      });
      return () => {
        alive = false;
      };
    }, [id])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: person?.name ?? '',
      headerRight: () =>
        person ? (
          <Pressable
            onPress={() => navigation.navigate('PersonEdit', { id })}
            hitSlop={10}
          >
            <Text style={{ color: c.accent, fontSize: 17, fontWeight: '700' }}>
              Edit
            </Text>
          </Pressable>
        ) : null,
    });
  }, [navigation, person, id, c.accent]);

  // The person was deleted from the edit screen — go back to the list.
  useEffect(() => {
    if (missing) navigation.navigate('People');
  }, [missing, navigation]);

  if (!person) return <View style={{ flex: 1, backgroundColor: c.bg }} />;

  const reviewed = person.stats.gotIt + person.stats.close + person.stats.missed;

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={styles.content}
    >
      {person.photos.length > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
        >
          {person.photos.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.hero} />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.heroFallback}>
          <Avatar name={person.name} size={160} rounded={false} />
        </View>
      )}

      <Text style={[styles.name, { color: c.ink }]}>{person.name}</Text>
      {person.pronouns.trim().length > 0 && (
        <Text style={[styles.pronouns, { color: c.inkSoft }]}>
          {person.pronouns}
        </Text>
      )}

      {person.groups.length > 0 && (
        <View style={styles.chipWrap}>
          {person.groups.map((g) => (
            <Chip key={g} label={g} />
          ))}
        </View>
      )}

      {person.notes.trim().length > 0 && (
        <Text style={[styles.notes, { color: c.ink }]}>{person.notes}</Text>
      )}

      {reviewed > 0 && (
        <Text style={[styles.stats, { color: c.inkSoft }]}>
          Practiced {reviewed}× · {person.stats.gotIt} got it ·{' '}
          {person.stats.close} close · {person.stats.missed} missed
        </Text>
      )}

      <Button
        label="Practice just this person"
        onPress={() => navigation.navigate('Play', { personId: person.id })}
        style={{ marginTop: 28 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 48 },
  hero: { width: 300, height: 300, borderRadius: 20 },
  heroFallback: { alignItems: 'center', marginVertical: 8 },
  name: { fontSize: 28, fontWeight: '800', marginTop: 18 },
  pronouns: { fontSize: 15, fontWeight: '600', marginTop: 4 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  notes: { fontSize: 17, lineHeight: 25, marginTop: 16 },
  stats: { fontSize: 13, marginTop: 20 },
});
