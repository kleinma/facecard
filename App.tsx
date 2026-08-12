import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { RootStackParamList } from './src/navigation';
import PeopleListScreen from './src/screens/PeopleListScreen';
import PersonDetailScreen from './src/screens/PersonDetailScreen';
import PersonEditScreen from './src/screens/PersonEditScreen';
import PlayScreen from './src/screens/PlayScreen';
import ScoreScreen from './src/screens/ScoreScreen';
import SessionSetupScreen from './src/screens/SessionSetupScreen';
import { dark, light } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

function navTheme(dark_: boolean): Theme {
  const c = dark_ ? dark : light;
  const base = dark_ ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: c.accent,
      background: c.bg,
      card: c.surface,
      text: c.ink,
      border: c.line,
    },
  };
}

export default function App() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme(isDark)}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack.Navigator initialRouteName="People">
          <Stack.Screen
            name="People"
            component={PeopleListScreen}
            options={{ title: 'Facecard' }}
          />
          <Stack.Screen
            name="PersonEdit"
            component={PersonEditScreen}
            options={{ title: 'Add person', presentation: 'modal' }}
          />
          <Stack.Screen
            name="PersonDetail"
            component={PersonDetailScreen}
            options={{ title: '' }}
          />
          <Stack.Screen
            name="SessionSetup"
            component={SessionSetupScreen}
            options={{ title: 'New session' }}
          />
          <Stack.Screen
            name="Play"
            component={PlayScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Score"
            component={ScoreScreen}
            options={{ title: 'Session score', headerBackVisible: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
