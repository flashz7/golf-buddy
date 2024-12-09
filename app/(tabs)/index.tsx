// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { format } from 'date-fns';
import { auth, db } from '../../src/config/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import Calendar from '../../src/components/Calendar/Calendar';

export default function Dashboard() {
  const user = auth.currentUser;
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [usersByDate, setUsersByDate] = useState<Record<string, Array<{ id: string; photoURL: string; displayName: string }>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserDates();
  }, []);

  const loadUserDates = async () => {
    if (!user) return;

    try {
      const datesCollection = collection(db, 'dates');
      const snapshot = await getDocs(datesCollection);
      
      const dateUsers: Record<string, Array<{ id: string; photoURL: string; displayName: string }>> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const dateStr = format(data.date.toDate(), 'yyyy-MM-dd');
        if (!dateUsers[dateStr]) {
          dateUsers[dateStr] = [];
        }
        dateUsers[dateStr].push({
          id: data.userId,
          photoURL: data.userPhotoURL,
          displayName: data.userDisplayName,
        });
      });

      setUsersByDate(dateUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dates:', error);
      setLoading(false);
    }
  };

  const handleDateSelect = async (date: Date) => {
    if (!user) return;

    try {
        const dateStr = format(date, 'yyyy-MM-dd');
        const datesCollection = collection(db, 'dates');
        
        // Check if user already voted for this date
        const q = query(
            datesCollection,
            where('userId', '==', user.uid),
            where('date', '==', date)
        );
        const existingVotes = await getDocs(q);

        if (!existingVotes.empty) {
            // User already voted for this date, remove the vote
            const docToDelete = existingVotes.docs[0];
            await deleteDoc(docToDelete.ref);
            setSelectedDates(selectedDates.filter(d => 
                format(d, 'yyyy-MM-dd') !== dateStr
            ));
        } else {
            // User hasn't voted for this date yet
            if (selectedDates.length >= 5) {
                Alert.alert('Limit Reached', 'You can only select up to 5 dates');
                return;
            }
            
            await addDoc(collection(db, 'dates'), {
                userId: user.uid,
                userPhotoURL: user.photoURL,
                userDisplayName: user.displayName || 'Anonymous',
                date: date,
                createdAt: new Date(),
            });
            setSelectedDates([...selectedDates, date]);
        }

        loadUserDates();
    } catch (error) {
        console.error('Error updating date selection:', error);
    }
};

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading calendar...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {user?.displayName || 'Golfer'}!
        </Text>
      </View>
      
      <View style={styles.calendar}>
        <Text style={styles.sectionTitle}>Available Dates</Text>
        <Calendar
          selectedDates={selectedDates}
          onDateSelect={handleDateSelect}
          usersByDate={usersByDate}
          maxSelections={5}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#2C5530',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 40,
  },
  calendar: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C5530',
    marginBottom: 15,
  },
});