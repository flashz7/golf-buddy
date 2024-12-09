// app/(tabs)/explore.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { format } from 'date-fns';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../../src/config/firebase';

interface GameDate {
  date: Date;
  users: Array<{
    id: string;
    displayName: string;
    photoURL: string;
  }>;
}

export default function GamesScreen() {
  const [upcomingDates, setUpcomingDates] = useState<GameDate[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadGames = async () => {
    try {
      setLoading(true);
      const datesCollection = collection(db, 'dates');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const q = query(
        datesCollection,
        where('date', '>=', today),
        orderBy('date', 'asc')
      );

      const snapshot = await getDocs(q);
      
      // Group dates by day
      const dateGroups: Record<string, GameDate> = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const dateStr = format(data.date.toDate(), 'yyyy-MM-dd');
        
        if (!dateGroups[dateStr]) {
          dateGroups[dateStr] = {
            date: data.date.toDate(),
            users: []
          };
        }
        
        dateGroups[dateStr].users.push({
          id: data.userId,
          displayName: data.userDisplayName,
          photoURL: data.userPhotoURL
        });
      });

      // Convert to array and sort by date
      const sortedDates = Object.values(dateGroups).sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );

      setUpcomingDates(sortedDates);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGames();
    setRefreshing(false);
  };

  const renderUserAvatar = (user: { photoURL: string; displayName: string }) => (
    <View style={styles.avatarContainer}>
      {user.photoURL ? (
        <Image source={{ uri: user.photoURL }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.placeholderAvatar]}>
          <Text style={styles.avatarText}>
            {user.displayName?.charAt(0) || '?'}
          </Text>
        </View>
      )}
    </View>
);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading games...</Text>
      </View>
    );
  }

  if (upcomingDates.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.centerContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.noGamesText}>No upcoming games found</Text>
        <Text style={styles.subText}>Pull down to refresh</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {upcomingDates.map((gameDate, index) => (
        <View key={index} style={styles.gameCard}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              {format(gameDate.date, 'EEE, MMM d')}
            </Text>
            <Text style={styles.playerCount}>
              {gameDate.users.length} player{gameDate.users.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.playersContainer}>
            {gameDate.users.map((user, userIndex) => (
              <View key={userIndex} style={styles.playerItem}>
                {renderUserAvatar(user)}
                <Text style={styles.playerName} numberOfLines={1}>
                  {user.displayName}
                </Text>
              </View>
            ))}
          </View>

          {gameDate.users.length >= 3 && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>Game Confirmed!</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  gameCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C5530',
  },
  playerCount: {
    fontSize: 14,
    color: '#666',
  },
  playersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 10,
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  placeholderAvatar: {
    backgroundColor: '#2C5530',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerName: {
    fontSize: 14,
    color: '#333',
    maxWidth: 100,
  },
  statusContainer: {
    backgroundColor: '#e8f5e9',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  statusText: {
    color: '#2C5530',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  noGamesText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: '#999',
  },
});