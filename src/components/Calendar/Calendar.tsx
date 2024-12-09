// src/components/Calendar/Calendar.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity 
} from 'react-native';
import { 
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isPast,
  addMonths,
  subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import DateCell from './DateCell';

interface CalendarProps {
  selectedDates: Date[];
  onDateSelect: (date: Date) => void;
  usersByDate: Record<string, Array<{ id: string; photoURL: string; displayName: string; }>>;
  maxSelections?: number;
}

export default function Calendar({ 
  selectedDates, 
  onDateSelect, 
  usersByDate,
  maxSelections = 5 
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const allDates = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const weeks = allDates.reduce((acc: Date[][], date, i) => {
    if (i % 7 === 0) acc.push([]);
    acc[acc.length - 1].push(date);
    return acc;
  }, []);

  const handleDateSelect = (date: Date) => {
    if (isPast(date)) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const isSelected = selectedDates.some(d => 
      format(d, 'yyyy-MM-dd') === dateStr
    );

    if (!isSelected && selectedDates.length >= maxSelections) {
      // Maybe show an alert here
      return;
    }

    onDateSelect(date);
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some(d => 
      format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const isDateLocked = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return usersByDate[dateStr]?.length >= 3; // Adjust threshold as needed
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
          style={styles.monthButton}
        >
          <ChevronLeft size={24} color="#2C5530" />
        </TouchableOpacity>
        
        <Text style={styles.monthText}>
          {format(currentMonth, 'MMMM yyyy')}
        </Text>
        
        <TouchableOpacity
          onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
          style={styles.monthButton}
        >
          <ChevronRight size={24} color="#2C5530" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekdays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.weekdayText}>{day}</Text>
        ))}
      </View>

      <ScrollView>
        {weeks.map((week, i) => (
          <View key={i} style={styles.week}>
            {week.map((date, j) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              return (
                <DateCell
                  key={`${i}-${j}`}
                  date={date}
                  isSelected={isDateSelected(date)}
                  isToday={isToday(date)}
                  isPast={isPast(date)}
                  users={usersByDate[dateStr] || []}
                  onSelect={() => handleDateSelect(date)}
                  isLocked={isDateLocked(date)}
                />
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f8f8f8',
  },
  monthButton: {
    padding: 5,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C5530',
  },
  weekdays: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  week: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});