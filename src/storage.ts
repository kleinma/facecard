import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';

import type { Grade, Person } from './types';
import { newId } from './utils';

// Where the deck lives. Bumping the version suffix would let us migrate later.
const PEOPLE_KEY = 'facecard.people.v1';
// Photos are copied into this folder inside the app's private sandbox, so they
// survive even if the original is deleted from the camera roll — and no other
// app can read them.
const PHOTO_DIR = 'photos';

function photoDirectory(): Directory {
  return new Directory(Paths.document, PHOTO_DIR);
}

function ensurePhotoDir(): Directory {
  const dir = photoDirectory();
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

/** Load the whole deck. Returns [] on first run or if anything is corrupt. */
export async function loadPeople(): Promise<Person[]> {
  try {
    const raw = await AsyncStorage.getItem(PEOPLE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Person[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalize);
  } catch {
    return [];
  }
}

/** Fill in any missing fields so older/partial records stay safe to use. */
function normalize(p: Partial<Person>): Person {
  return {
    id: p.id ?? newId(),
    name: p.name ?? '',
    pronouns: p.pronouns ?? '',
    notes: p.notes ?? '',
    groups: Array.isArray(p.groups) ? p.groups : [],
    photos: Array.isArray(p.photos) ? p.photos : [],
    createdAt: p.createdAt ?? Date.now(),
    stats: {
      gotIt: p.stats?.gotIt ?? 0,
      close: p.stats?.close ?? 0,
      missed: p.stats?.missed ?? 0,
    },
  };
}

async function saveAll(people: Person[]): Promise<void> {
  await AsyncStorage.setItem(PEOPLE_KEY, JSON.stringify(people));
}

/** Insert a new person or update an existing one (matched by id). */
export async function upsertPerson(person: Person): Promise<Person[]> {
  const people = await loadPeople();
  const idx = people.findIndex((p) => p.id === person.id);
  if (idx >= 0) people[idx] = person;
  else people.push(person);
  await saveAll(people);
  return people;
}

/** Delete a person and clean up their photo files. */
export async function deletePerson(id: string): Promise<Person[]> {
  const people = await loadPeople();
  const victim = people.find((p) => p.id === id);
  if (victim) {
    for (const uri of victim.photos) deletePhotoFile(uri);
  }
  const remaining = people.filter((p) => p.id !== id);
  await saveAll(remaining);
  return remaining;
}

/**
 * Copy a just-picked image into private storage and return the new URI.
 * The caller stores that URI on the person.
 */
export async function savePhoto(sourceUri: string): Promise<string> {
  const dir = ensurePhotoDir();
  const extMatch = sourceUri.split('?')[0].match(/\.(\w{3,4})$/);
  const ext = extMatch ? extMatch[1] : 'jpg';
  const dest = new File(dir, `${newId()}.${ext}`);
  const source = new File(sourceUri);
  await source.copy(dest);
  return dest.uri;
}

/** Best-effort delete of a stored photo file. Never throws. */
export function deletePhotoFile(uri: string): void {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // A missing file is fine — nothing to clean up.
  }
}

/** Apply a batch of session grades to per-person stats, all at once. */
export async function applyGrades(
  results: { id: string; grade: Grade }[]
): Promise<void> {
  if (results.length === 0) return;
  const people = await loadPeople();
  const byId = new Map(people.map((p) => [p.id, p]));
  for (const { id, grade } of results) {
    const p = byId.get(id);
    if (p) p.stats[grade] += 1;
  }
  await saveAll(people);
}
