import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// One place that describes every screen and the params it takes.
export type RootStackParamList = {
  People: undefined;
  PersonEdit: { id?: string } | undefined;
  PersonDetail: { id: string };
  SessionSetup: undefined;
  Play:
    | { group?: string | null; personId?: string; ids?: string[] }
    | undefined;
  Score: {
    gotIt: number;
    close: number;
    missed: number;
    reviewIds: string[];
  };
};

export type ScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
