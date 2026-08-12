import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Avatar from '../components/Avatar';
import Button from '../components/Button';
import type { ScreenProps } from '../navigation';
import { loadPeople } from '../storage';
import { useTheme } from '../theme';
import type { Person } from '../types';

export default function ScoreScreen({ navigation, route }: ScreenProps<'Score'>) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const { gotIt, close, missed, reviewIds } = route.params;
  const total = gotIt + close + missed;

  const [review, setReview] = useState<Person[]>([]);
  const uniqueReview = Array.from(new Set(reviewIds));

  useEffect(() => {
    loadPeople().then((people) => {
      const byId = new Map(people.map((p) => [p.id, p]));
      setReview(uniqueReview.map((id) => byId.get(id)).filter(Boolean) as Person[]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {total === 0 ? (
          <Text style={[styles.none, { color: c.inkSoft }]}>
            You ended before grading anyone. No score this time.
          </Text>
        ) : (
          <>
            <Text style={[styles.big, { color: c.ink }]}>
              {gotIt}
              <Text style={[styles.bigDenom, { color: c.inkSoft }]}>
                {' '}
                / {total} got it
              </Text>
            </Text>

            <View style={styles.tallies}>
              <Tally n={gotIt} label="Got it" color={c.good} c={c} />
              <Tally n={close} label="Close" color={c.amber} c={c} />
              <Tally n={missed} label="Missed" color={c.bad} c={c} />
            </View>

            {review.length > 0 && (
              <View style={styles.reviewBlock}>
                <Text style={[styles.reviewTitle, { color: c.inkSoft }]}>
                  Worth another look
                </Text>
                <View style={styles.reviewRow}>
                  {review.map((p) => (
                    <View key={p.id} style={styles.reviewItem}>
                      <Avatar name={p.name} photo={p.photos[0]} size={56} />
                      <Text
                        numberOfLines={1}
                        style={[styles.reviewName, { color: c.ink }]}
                      >
                        {p.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {uniqueReview.length > 0 && (
          <Button
            label={`Practice these ${uniqueReview.length} again`}
            onPress={() =>
              navigation.replace('Play', { ids: uniqueReview })
            }
          />
        )}
        <Button
          label="Done"
          variant="ghost"
          onPress={() => navigation.popToTop()}
        />
      </View>
    </View>
  );
}

function Tally({
  n,
  label,
  color,
  c,
}: {
  n: number;
  label: string;
  color: string;
  c: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[styles.tally, { borderColor: color, backgroundColor: c.surface }]}>
      <Text style={[styles.tallyN, { color }]}>{n}</Text>
      <Text style={[styles.tallyLabel, { color: c.inkSoft }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, alignItems: 'center' },
  none: { fontSize: 16, textAlign: 'center', marginTop: 40, lineHeight: 24 },
  big: { fontSize: 56, fontWeight: '900', marginTop: 20 },
  bigDenom: { fontSize: 20, fontWeight: '700' },
  tallies: { flexDirection: 'row', gap: 12, marginTop: 24 },
  tally: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: 'center',
    minWidth: 88,
  },
  tallyN: { fontSize: 30, fontWeight: '900' },
  tallyLabel: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  reviewBlock: { marginTop: 40, alignSelf: 'stretch' },
  reviewTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 14,
    textAlign: 'center',
  },
  reviewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    justifyContent: 'center',
  },
  reviewItem: { alignItems: 'center', gap: 6, width: 72 },
  reviewName: { fontSize: 12, fontWeight: '600', maxWidth: 72, textAlign: 'center' },
  footer: { padding: 16, gap: 10 },
});
