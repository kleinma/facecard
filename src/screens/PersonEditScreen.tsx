import { useHeaderHeight } from '@react-navigation/elements';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  type LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Button from '../components/Button';
import Chip from '../components/Chip';
import type { ScreenProps } from '../navigation';
import {
  deletePerson,
  deletePhotoFile,
  loadPeople,
  savePhoto,
  upsertPerson,
} from '../storage';
import { useTheme } from '../theme';
import { PRONOUN_PRESETS, type Person } from '../types';
import { newId } from '../utils';

export default function PersonEditScreen({
  navigation,
  route,
}: ScreenProps<'PersonEdit'>) {
  const c = useTheme();
  const headerHeight = useHeaderHeight();
  const editId = route.params?.id;

  // Auto-scroll the focused field above the keyboard. We remember each field's
  // vertical position (measured on layout) and scroll to it when it's focused.
  const scrollRef = useRef<ScrollView>(null);
  const fieldY = useRef<Record<string, number>>({});
  const onFieldLayout = (key: string) => (e: LayoutChangeEvent) => {
    fieldY.current[key] = e.nativeEvent.layout.y;
  };
  const scrollToField = (key: string) => {
    // A short delay lets the keyboard start opening first.
    setTimeout(() => {
      const y = fieldY.current[key];
      if (y != null) {
        scrollRef.current?.scrollTo({ y: Math.max(y - 16, 0), animated: true });
      }
    }, 80);
  };

  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [newGroup, setNewGroup] = useState('');
  const [busy, setBusy] = useState(false);

  // Photos that already existed when we opened the screen — used so we only
  // delete files the user actually removed (and only once they save).
  const [originalPhotos, setOriginalPhotos] = useState<string[]>([]);
  const [suggestedGroups, setSuggestedGroups] = useState<string[]>([]);

  // Load the person to edit (if any) plus group suggestions from the deck.
  useEffect(() => {
    loadPeople().then((people) => {
      const groupSet = new Set<string>();
      people.forEach((p) => p.groups.forEach((g) => groupSet.add(g)));
      if (editId) {
        const p = people.find((x) => x.id === editId);
        if (p) {
          setName(p.name);
          setPronouns(p.pronouns);
          setNotes(p.notes);
          setPhotos(p.photos);
          setOriginalPhotos(p.photos);
          setGroups(p.groups);
          p.groups.forEach((g) => groupSet.delete(g));
        }
      }
      setSuggestedGroups([...groupSet].sort((a, b) => a.localeCompare(b)));
      setLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const canSave = name.trim().length > 0 && !busy;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: editId ? 'Edit person' : 'Add person',
      headerRight: () => (
        <Pressable onPress={save} disabled={!canSave} hitSlop={10}>
          <Text
            style={{
              color: canSave ? c.accent : c.inkSoft,
              fontSize: 17,
              fontWeight: '700',
            }}
          >
            Save
          </Text>
        </Pressable>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, canSave, name, pronouns, notes, photos, groups]);

  async function addPhoto(source: 'camera' | 'library') {
    try {
      const perm =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permission needed',
          `Facecard needs access to your ${
            source === 'camera' ? 'camera' : 'photos'
          } to add a picture. You can turn this on in Settings.`
        );
        return;
      }
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.7,
            });
      if (result.canceled) return;
      setBusy(true);
      const stored = await savePhoto(result.assets[0].uri);
      setPhotos((prev) => [...prev, stored]);
    } catch (e) {
      Alert.alert('Could not add photo', String(e));
    } finally {
      setBusy(false);
    }
  }

  function choosePhotoSource() {
    Alert.alert('Add a photo', undefined, [
      { text: 'Take photo', onPress: () => addPhoto('camera') },
      { text: 'Choose from library', onPress: () => addPhoto('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function removePhoto(uri: string) {
    Alert.alert('Remove this photo?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          // If it's a photo we added this session, delete the file now.
          // Existing photos are cleaned up on save instead.
          if (!originalPhotos.includes(uri)) deletePhotoFile(uri);
          setPhotos((prev) => prev.filter((p) => p !== uri));
        },
      },
    ]);
  }

  function addGroup(raw: string) {
    const g = raw.trim();
    if (!g) return;
    if (!groups.some((x) => x.toLowerCase() === g.toLowerCase())) {
      setGroups((prev) => [...prev, g]);
    }
    setNewGroup('');
    setSuggestedGroups((prev) => prev.filter((x) => x !== g));
  }

  async function save() {
    if (!canSave) return;
    setBusy(true);
    try {
      // Delete files for previously-saved photos the user removed.
      for (const uri of originalPhotos) {
        if (!photos.includes(uri)) deletePhotoFile(uri);
      }
      const person: Person = {
        id: editId ?? newId(),
        name: name.trim(),
        pronouns: pronouns.trim(),
        notes: notes.trim(),
        groups,
        photos,
        createdAt: Date.now(),
        stats: { gotIt: 0, close: 0, missed: 0 },
      };
      // Preserve stats and original creation time when editing.
      if (editId) {
        const existing = (await loadPeople()).find((p) => p.id === editId);
        if (existing) {
          person.createdAt = existing.createdAt;
          person.stats = existing.stats;
        }
      }
      await upsertPerson(person);
      navigation.goBack();
    } catch (e) {
      setBusy(false);
      Alert.alert('Could not save', String(e));
    }
  }

  function confirmDelete() {
    if (!editId) return;
    Alert.alert(`Delete ${name || 'this person'}?`, 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePerson(editId);
          navigation.navigate('People');
        },
      },
    ]);
  }

  if (!loaded) return <View style={{ flex: 1, backgroundColor: c.bg }} />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        ref={scrollRef}
        style={{ backgroundColor: c.bg }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
      <Text style={[styles.label, { color: c.inkSoft }]}>Photos</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
      >
        {photos.map((uri) => (
          <Pressable key={uri} onPress={() => removePhoto(uri)}>
            <Image source={{ uri }} style={styles.photo} />
          </Pressable>
        ))}
        <Pressable
          onPress={choosePhotoSource}
          style={[
            styles.addPhoto,
            { borderColor: c.line, backgroundColor: c.surface2 },
          ]}
        >
          <Text style={{ fontSize: 26, color: c.inkSoft }}>＋</Text>
          <Text style={{ fontSize: 11, color: c.inkSoft }}>Photo</Text>
        </Pressable>
      </ScrollView>
      {photos.length > 0 && (
        <Text style={[styles.hint, { color: c.inkSoft }]}>
          Tap a photo to remove it.
        </Text>
      )}

      <Text style={[styles.label, { color: c.inkSoft }]}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. Jess Morgan"
        placeholderTextColor={c.inkSoft}
        style={[styles.input, inputColors(c)]}
      />

      <Text style={[styles.label, { color: c.inkSoft }]}>Pronouns</Text>
      <View style={styles.chipWrap}>
        {PRONOUN_PRESETS.map((preset) => (
          <Chip
            key={preset}
            label={preset}
            selected={pronouns.trim().toLowerCase() === preset}
            onPress={() =>
              setPronouns((cur) =>
                cur.trim().toLowerCase() === preset ? '' : preset
              )
            }
          />
        ))}
      </View>
      <TextInput
        value={pronouns}
        onChangeText={setPronouns}
        onLayout={onFieldLayout('pronouns')}
        onFocus={() => scrollToField('pronouns')}
        placeholder="Or type a custom set…"
        placeholderTextColor={c.inkSoft}
        autoCapitalize="none"
        style={[styles.input, inputColors(c), { marginTop: 10 }]}
      />

      <Text style={[styles.label, { color: c.inkSoft }]}>Notes</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        onLayout={onFieldLayout('notes')}
        onFocus={() => scrollToField('notes')}
        placeholder="How you know them, fun facts… e.g. Met at college, wine nights together. Hiking buddy."
        placeholderTextColor={c.inkSoft}
        multiline
        style={[styles.input, styles.notes, inputColors(c)]}
      />

      <Text style={[styles.label, { color: c.inkSoft }]}>Groups</Text>
      <View style={styles.chipWrap}>
        {groups.map((g) => (
          <Chip key={g} label={g} selected onRemove={() => setGroups((p) => p.filter((x) => x !== g))} />
        ))}
      </View>
      <View style={styles.groupAddRow} onLayout={onFieldLayout('groups')}>
        <TextInput
          value={newGroup}
          onChangeText={setNewGroup}
          onFocus={() => scrollToField('groups')}
          placeholder="Add a group…"
          placeholderTextColor={c.inkSoft}
          onSubmitEditing={() => addGroup(newGroup)}
          returnKeyType="done"
          style={[styles.input, inputColors(c), { flex: 1, marginBottom: 0 }]}
        />
        <Button
          label="Add"
          variant="ghost"
          onPress={() => addGroup(newGroup)}
          style={{ paddingVertical: 12 }}
        />
      </View>
      {suggestedGroups.length > 0 && (
        <>
          <Text style={[styles.hint, { color: c.inkSoft }]}>
            Or tap one you've used before:
          </Text>
          <View style={styles.chipWrap}>
            {suggestedGroups.map((g) => (
              <Chip key={g} label={g} onPress={() => addGroup(g)} />
            ))}
          </View>
        </>
      )}

        {editId && (
          <Button
            label="Delete person"
            variant="ghost"
            color={c.bad}
            onPress={confirmDelete}
            style={{ marginTop: 36, borderColor: c.bad }}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function inputColors(c: ReturnType<typeof useTheme>) {
  return { backgroundColor: c.surface, borderColor: c.line, color: c.ink };
}

const styles = StyleSheet.create({
  // Roomy bottom padding so even the lowest field can scroll clear of the keyboard.
  content: { padding: 16, paddingBottom: 340 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 20,
    marginBottom: 8,
  },
  hint: { fontSize: 13, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 4,
  },
  notes: { minHeight: 96, textAlignVertical: 'top' },
  photo: { width: 88, height: 88, borderRadius: 14 },
  addPhoto: {
    width: 88,
    height: 88,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  groupAddRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 10 },
});
