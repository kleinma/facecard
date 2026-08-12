// The core data model for Facecard. Everything lives on the device;
// nothing here ever leaves the phone.

export type Grade = 'gotIt' | 'close' | 'missed';

export type PersonStats = {
  gotIt: number;
  close: number;
  missed: number;
};

export type Person = {
  id: string;
  name: string;
  /** Free-form notes: how you know them, fun facts, anything. */
  notes: string;
  /** Free-form tags like "College" or "Minnesota". A person can have several. */
  groups: string[];
  /** Local file URIs inside the app's private storage. */
  photos: string[];
  createdAt: number;
  stats: PersonStats;
};

/** The three things a card can show. */
export type Facet = 'face' | 'name' | 'notes';
