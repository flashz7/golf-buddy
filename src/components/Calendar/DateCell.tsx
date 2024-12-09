// src/components/Calendar/DateCell.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface User {
    id: string;
    photoURL: string | null;
    displayName: string | null; // Update interface to make displayName optional
  }

interface DateCellProps {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  isPast: boolean;
  users: User[];
  onSelect: () => void;
  isLocked: boolean;
}

// Update the part where we display the user initial
const UserAvatar = ({ user }: { user: User }) => {
    // Get a safe display name initial
    const getInitial = () => {
      if (!user.displayName) return '?';
      return user.displayName.trim()[0] || '?';
    };
  
    return user.photoURL ? (
      <Image 
        source={{ uri: user.photoURL }}
        style={styles.userImage}
      />
    ) : (
      <View style={styles.userInitial}>
        <Text style={styles.userInitialText}>
          {getInitial()}
        </Text>
      </View>
    );
  };
  
  export default function DateCell({ 
    date, 
    isSelected, 
    isToday,
    isPast,
    users, 
    onSelect,
    isLocked 
  }: DateCellProps) {
    return (
      <TouchableOpacity 
        style={[
          styles.container,
          isToday && styles.today,
          isSelected && styles.selected,
          isPast && styles.past,
          isLocked && styles.locked
        ]}
        onPress={onSelect}
        disabled={isPast}
      >
        <Text style={[
          styles.dateText,
          (isSelected || isToday) && styles.selectedText,
          isPast && styles.pastText
        ]}>
          {date.getDate()}
        </Text>
        
        {users.length > 0 && (
          <View style={styles.usersContainer}>
            {users.slice(0, 3).map((user, index) => (
              <View 
                key={user.id} 
                style={[
                  styles.userImageContainer,
                  { marginLeft: index > 0 ? -10 : 0 }
                ]}
              >
                <UserAvatar user={user} />
              </View>
            ))}
            {users.length > 3 && (
              <View style={[styles.userImageContainer, { marginLeft: -10 }]}>
                <View style={styles.moreUsers}>
                  <Text style={styles.moreUsersText}>
                    +{users.length - 3}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 1,
    padding: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  today: {
    backgroundColor: '#e8f5e9',
  },
  selected: {
    backgroundColor: '#2C5530',
  },
  past: {
    backgroundColor: '#f5f5f5',
  },
  locked: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  selectedText: {
    color: '#fff',
  },
  pastText: {
    color: '#999',
  },
  usersContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 2,
    left: 2,
  },
  userImageContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fff',
  },
  userImage: {
    width: '100%',
    height: '100%',
  },
  userInitial: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2C5530',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitialText: {
    color: '#fff',
    fontSize: 10,
  },
  moreUsers: {
    width: '100%',
    height: '100%',
    backgroundColor: '#888',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreUsersText: {
    color: '#fff',
    fontSize: 8,
  },
});