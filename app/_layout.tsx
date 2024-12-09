// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/config/firebase';

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  if (initializing) {
    return null; // Or a loading screen
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}