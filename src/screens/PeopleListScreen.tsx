import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Avatar from '../components/Avatar';
import Button from '../components/Button';
import Chip from '../components/Chip';
import type { ScreenProps } from '../navigation';
import { loadPeople } from '../storage';
import { useTheme } from '../theme';
import type { Person } from '../types';

const COLUMNS = 3;

export default function PeopleListScreen({ navigation }: ScreenProps<'People'>) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const [people, setPeople] = useState<Person[]>([]);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<string | null>(null);

  // Reload every time the screen comes back into view (after add/edit/delete).
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      loadPeople().then((p) => {
        if (alive) setPeople(p);
      });
      return () => {
        alive = false;
      };
    }, [])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('PersonEdit')}
          hitSlop={12}
        >
          <Text style={{ color: c.accent, fontSize: 26, fontWeight: '600' }}>
            ＋
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, c.accent]);

  const allGroups = useMemo(() => {
    const set = new Set<string>();
    people.forEach((p) => p.groups.forEach((g) => set.add(g)));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [people]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return people
      .filter((p) => (group ? p.groups.includes(group) : true))
      .filter((p) =>
        q
          ? p.name.toLowerCase().includes(q) ||
            p.notes.toLowerCase().includes(q) ||
            p.groups.some((g) => g.toLowerCase().includes(q))
          : true
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [people, query, group]);

  if (people.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: c.bg }]}>
        <Text style={styles.emptyEmoji}>🃏</Text>
        <Text style={[styles.emptyTitle, { color: c.ink }]}>
          Your deck is empty
        </Text>
        <Text style={[styles.emptyBody, { color: c.inkSoft }]}>
          Add the first person — a photo, their name, and a note or two about
          how you know them.
        </Text>
        <Button
          label="Add someone"
          onPress={() => navigation.navigate('PersonEdit')}
          style={{ marginTop: 20, alignSelf: 'stretch' }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <TextInput
        placeholder="Search people…"
        placeholderTextColor={c.inkSoft}
        value={query}
        onChangeText={setQuery}
        style={[
          styles.search,
          { backgroundColor: c.surface, borderColor: c.line, color: c.ink },
        ]}
      />

      {allGroups.length > 0 && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['All', ...allGroups]}
          keyExtractor={(g) => g}
          style={styles.groupRow}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
          renderItem={({ item }) => {
            const isAll = item === 'All';
            const selected = isAll ? group === null : group === item;
            return (
              <Chip
                label={item}
                selected={selected}
                onPress={() => setGroup(isAll ? null : item)}
              />
            );
          }}
        />
      )}

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        numColumns={COLUMNS}
        contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
        columnWrapperStyle={{ gap: 8 }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListEmptyComponent={
          <Text style={[styles.noMatch, { color: c.inkSoft }]}>
            Nobody matches that.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.cell}
            onPress={() =>
              navigation.navigate('PersonDetail', { id: item.id })
            }
          >
            <Avatar name={item.name} photo={item.photos[0]} size={92} />
            <Text
              numberOfLines={1}
              style={[styles.cellName, { color: c.ink }]}
            >
              {item.name}
            </Text>
          </Pressable>
        )}
      />

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + 12, backgroundColor: c.bg },
        ]}
      >
        <Button
          label={`Practice  ▶  ${people.length} ${
            people.length === 1 ? 'person' : 'people'
          }`}
          onPress={() => navigation.navigate('SessionSetup')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  groupRow: { flexGrow: 0, marginVertical: 8 },
  cell: { flex: 1 / COLUMNS, alignItems: 'center', gap: 6 },
  cellName: { fontSize: 13, fontWeight: '600', maxWidth: 96, textAlign: 'center' },
  noMatch: { textAlign: 'center', marginTop: 40 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'transparent',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyEmoji: { fontSize: 44, marginBottom: 12 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  emptyBody: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
