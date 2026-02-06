/**
 * Tabs Layout
 * Bottom tab navigation with 4 tabs
 */

import { Tabs, Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Pressable } from 'react-native';

function SettingsButton() {
  return (
    <Link href="/settings" asChild>
      <Pressable style={{ marginRight: 16 }}>
        <Feather name="settings" size={22} color="#6B7280" />
      </Pressable>
    </Link>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: '#111827',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          headerTitle: 'Virtus',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
          headerRight: () => <SettingsButton />,
        }}
      />
      <Tabs.Screen
        name="formation"
        options={{
          title: 'Formation',
          headerTitle: 'Formation du jour',
          tabBarIcon: ({ color, size }) => (
            <Feather name="book-open" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: 'Parcours',
          headerTitle: 'Mon parcours',
          tabBarIcon: ({ color, size }) => (
            <Feather name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bilan"
        options={{
          title: 'Bilan',
          headerTitle: 'Mon bilan',
          tabBarIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
