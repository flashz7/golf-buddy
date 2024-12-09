// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
// Import different icons that are available in lucide-react-native
import { CircleDot, Calendar, UserCircle } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#2C5530',
      headerShown: false,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Calendar color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Games',
          tabBarIcon: ({ color }) => <CircleDot color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <UserCircle color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}