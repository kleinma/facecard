import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Avatar from '../components/Avatar';
import Chip from '../components/Chip';
import type { ScreenProps } from '../navigation';
import { applyGrades, loadPeople } from '../storage';
import { useTheme } from '../theme';
import type { Facet, Grade, Person } from '../types';
import { pick, shuffle } from '../utils';

type Card = { person: Person; facet: Facet };

// Decide what to show for a person: always allow the name; the face only if
// there's a photo; the notes only if they wrote some.
function facetsFor(p: Person): Facet[] {
  const options: Facet[] = ['name'];
  if (p.photos.length > 0) options.push('face');
  if (p.notes.trim().length > 0) options.push('notes');
  return options;
}

const PROMPTS: Record<Facet, string> = {
  face: 'Who is this — and how do you know them?',
  name: 'Picture their face. Who is this, and how do you know them?',
  notes: 'Who is this?',
};

export default function PlayScreen({ navigation, route }: ScreenProps<'Play'>) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const params = route.params ?? {};

  const [cards, setCards] = useState<Card[] | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  // Grades collected this session, kept in state so "End" can score too.
  const [results, setResults] = useState<{ id: string; grade: Grade }[]>([]);

  useEffect(() => {
    let alive = true;
    loadPeople().then((people) => {
      if (!alive) return;
      let selected: Person[];
      if (params.personId) {
        selected = people.filter((p) => p.id === params.personId);
      } else if (params.ids) {
        selected = people.filter((p) => params.ids!.includes(p.id));
      } else if (params.group) {
        selected = people.filter((p) => p.groups.includes(params.group!));
      } else {
        selected = people;
      }
      const deck = shuffle(selected).map((person) => ({
        person,
        facet: pick(facetsFor(person)),
      }));
      setCards(deck);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = cards?.length ?? 0;
  const current = cards && index < total ? cards[index] : null;

  const tally = useMemo(() => {
    const t = { gotIt: 0, close: 0, missed: 0 };
    results.forEach((r) => (t[r.grade] += 1));
    return t;
  }, [results]);

  async function finish(final: { id: string; grade: Grade }[]) {
    await applyGrades(final);
    const t = { gotIt: 0, close: 0, missed: 0 };
    final.forEach((r) => (t[r.grade] += 1));
    const reviewIds = final
      .filter((r) => r.grade !== 'gotIt')
      .map((r) => r.id);
    navigation.replace('Score', { ...t, reviewIds });
  }

  function grade(g: Grade) {
    if (!current) return;
    const next = [...results, { id: current.person.id, grade: g }];
    setResults(next);
    if (index + 1 < total) {
      setIndex(index + 1);
      setRevealed(false);
    } else {
      finish(next);
    }
  }

  if (!cards) {
    return <View style={{ flex: 1, backgroundColor: c.bg }} />;
  }

  if (!current) {
    // No one to practice (empty selection) — bail back out.
    return (
      <View style={[styles.centered, { backgroundColor: c.bg }]}>
        <Text style={{ color: c.inkSoft }}>Nobody to practice here.</Text>
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: c.accent, fontWeight: '700' }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const p = current.person;
  const showFacePrompt = current.facet === 'face';
  const showNamePrompt = current.facet === 'name';
  const showNotesPrompt = current.facet === 'notes';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: c.bg, paddingTop: insets.top + 6 },
      ]}
    >
      {/* Top bar: End (always) + progress counter */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => finish(results)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="End session and see score"
        >
          <Text style={[styles.end, { color: c.inkSoft }]}>■ End</Text>
        </Pressable>
        <Text style={[styles.counter, { color: c.inkSoft }]}>
          Card {index + 1} / {total}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.cardArea}
        showsVerticalScrollIndicator={false}
        accessibilityLiveRegion="polite"
      >
        {!revealed ? (
          <>
            <Text style={[styles.prompt, { color: c.inkSoft }]}>
              {PROMPTS[current.facet]}
            </Text>
            {showFacePrompt && (
              <Image
                source={{ uri: p.photos[0] }}
                style={styles.bigPhoto}
                accessible
                accessibilityRole="image"
                accessibilityLabel="Photo of the person to identify"
              />
            )}
            {showNamePrompt && (
              <Text style={[styles.bigName, { color: c.ink }]}>{p.name}</Text>
            )}
            {showNotesPrompt && (
              <View
                style={[
                  styles.notesCard,
                  { backgroundColor: c.surface, borderColor: c.line },
                ]}
              >
                <Text style={[styles.notesText, { color: c.ink }]}>
                  {p.notes}
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {p.photos.length > 0 ? (
              <Image
                source={{ uri: p.photos[0] }}
                style={styles.bigPhoto}
                accessible
                accessibilityRole="image"
                accessibilityLabel={`Photo of ${p.name}`}
              />
            ) : (
              <Avatar name={p.name} size={180} rounded={false} />
            )}
            <Text style={[styles.bigName, { color: c.ink }]}>{p.name}</Text>
            {p.pronouns.trim().length > 0 && (
              <Text style={[styles.pronouns, { color: c.inkSoft }]}>
                {p.pronouns}
              </Text>
            )}
            {p.groups.length > 0 && (
              <View style={styles.chipWrap}>
                {p.groups.map((g) => (
                  <Chip key={g} label={g} />
                ))}
              </View>
            )}
            {p.notes.trim().length > 0 && (
              <Text style={[styles.revealNotes, { color: c.ink }]}>
                {p.notes}
              </Text>
            )}
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {!revealed ? (
          <Pressable
            onPress={() => setRevealed(true)}
            accessibilityRole="button"
            accessibilityLabel="Reveal the answer"
            style={[styles.reveal, { backgroundColor: c.accent }]}
          >
            <Text style={[styles.revealLabel, { color: c.onAccent }]}>
              Reveal
            </Text>
          </Pressable>
        ) : (
          <View style={styles.grades}>
            <GradeButton label="Got it" color={c.good} onPress={() => grade('gotIt')} onAccent={c.onAccent} />
            <GradeButton label="Close" color={c.amber} onPress={() => grade('close')} onAccent={c.onAccent} />
            <GradeButton label="Missed" color={c.bad} onPress={() => grade('missed')} onAccent="#fff" />
          </View>
        )}
        <Text style={[styles.runningScore, { color: c.inkSoft }]}>
          {tally.gotIt} got it · {tally.close} close · {tally.missed} missed
        </Text>
      </View>
    </View>
  );
}

function GradeButton({
  label,
  color,
  onPress,
  onAccent,
}: {
  label: string;
  color: string;
  onPress: () => void;
  onAccent: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.grade,
        { backgroundColor: color, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={[styles.gradeLabel, { color: onAccent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  end: { fontSize: 15, fontWeight: '700' },
  counter: { fontSize: 15, fontWeight: '600' },
  cardArea: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 18,
  },
  prompt: { fontSize: 17, textAlign: 'center', lineHeight: 24 },
  bigPhoto: { width: 260, height: 260, borderRadius: 24 },
  bigName: { fontSize: 32, fontWeight: '800', textAlign: 'center' },
  pronouns: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  notesCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 22,
    width: '100%',
  },
  notesText: { fontSize: 22, lineHeight: 30, textAlign: 'center' },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  revealNotes: { fontSize: 18, lineHeight: 26, textAlign: 'center' },
  footer: { paddingHorizontal: 20, paddingTop: 10, gap: 12 },
  reveal: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  revealLabel: { fontSize: 18, fontWeight: '800' },
  grades: { flexDirection: 'row', gap: 10 },
  grade: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  gradeLabel: { fontSize: 16, fontWeight: '800' },
  runningScore: { fontSize: 13, textAlign: 'center' },
});
