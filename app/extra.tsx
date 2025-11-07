import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, FlatList, StyleSheet, TouchableOpacity, StatusBar, Animated, Pressable, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function DoctorNotes() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams();
  const [entries, setEntries] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPicking, setIsPicking] = useState(false);
  const [focusedInput, setFocusedInput] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [markedDates, setMarkedDates] = useState<{ [key: string]: boolean }>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleBack = () => {
    router.back();
  };

  // 🧠 Load saved notes and marked dates
  useEffect(() => {
    (async () => {
      const storageKey = patientId ? `doctor_notes_${patientId}` : 'doctor_notes';
      const calendarKey = patientId ? `calendar_marks_${patientId}` : 'calendar_marks';
      
      const stored = await AsyncStorage.getItem(storageKey);
      const storedMarks = await AsyncStorage.getItem(calendarKey);
      
      if (stored) setEntries(JSON.parse(stored));
      if (storedMarks) setMarkedDates(JSON.parse(storedMarks));
      
      setLoading(false);
    })();
  }, [patientId]);

  // 💾 Save locally
  const saveEntries = async (newEntries: any[]) => {
    setEntries(newEntries);
    const storageKey = patientId ? `doctor_notes_${patientId}` : 'doctor_notes';
    await AsyncStorage.setItem(storageKey, JSON.stringify(newEntries));
  };

  // 📅 Save marked dates
  const saveMarkedDates = async (newMarkedDates: { [key: string]: boolean }) => {
    setMarkedDates(newMarkedDates);
    const calendarKey = patientId ? `calendar_marks_${patientId}` : 'calendar_marks';
    await AsyncStorage.setItem(calendarKey, JSON.stringify(newMarkedDates));
  };

  // ✏️ Add text note
  const addTextNote = () => {
    if (!text.trim()) return;
    const newEntry = { id: Date.now().toString(), type: 'text', content: text, timestamp: new Date().toISOString() };
    const newEntries = [newEntry, ...entries];
    saveEntries(newEntries);
    setText('');
  };

  // 📷 Add image note
  const addImageNote = async () => {
    try {
      setIsPicking(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.6,
      });
      if (!result.canceled) {
        const newEntry = {
          id: Date.now().toString(),
          type: 'image',
          content: result.assets[0].base64,
          timestamp: new Date().toISOString(),
        };
        const newEntries = [newEntry, ...entries];
        await saveEntries(newEntries);
      }
    } catch (err) {
      console.log('Image picker error:', err);
    } finally {
      setTimeout(() => setIsPicking(false), 500);
    }
  };

  // 🗑️ Delete note
  const deleteNote = (id: string) => {
    const newEntries = entries.filter(entry => entry.id !== id);
    saveEntries(newEntries);
  };

  // 🌐 Open Streamlit app
  const openStreamlit = async () => {
    const streamlitUrl = 'https://lesion-classification.streamlit.app/';
    await WebBrowser.openBrowserAsync(streamlitUrl);
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // 📅 Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const toggleDateMark = (dateKey: string) => {
    const newMarkedDates = { ...markedDates };
    if (newMarkedDates[dateKey]) {
      delete newMarkedDates[dateKey];
    } else {
      newMarkedDates[dateKey] = true;
    }
    saveMarkedDates(newMarkedDates);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    
    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(year, month, day);
      const isMarked = markedDates[dateKey];
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            styles.calendarDayActive,
            isMarked && styles.calendarDayMarked,
            isToday && styles.calendarDayToday
          ]}
          onPress={() => toggleDateMark(dateKey)}
        >
          <Text style={[
            styles.calendarDayText,
            isMarked && styles.calendarDayTextMarked,
            isToday && styles.calendarDayTextToday
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return (
      <Modal
        visible={showCalendar}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={previousMonth} style={styles.calendarNavButton}>
                <Text style={styles.calendarNavText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>
                {monthNames[month]} {year}
              </Text>
              <TouchableOpacity onPress={nextMonth} style={styles.calendarNavButton}>
                <Text style={styles.calendarNavText}>→</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarDayNames}>
              {dayNames.map(name => (
                <View key={name} style={styles.calendarDayName}>
                  <Text style={styles.calendarDayNameText}>{name}</Text>
                </View>
              ))}
            </View>
            
            <ScrollView contentContainerStyle={styles.calendarGrid}>
              {days}
            </ScrollView>
            
            <View style={styles.calendarFooter}>
              <View style={styles.calendarLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.legendDotMarked]} />
                  <Text style={styles.legendText}>Marked</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.legendDotToday]} />
                  <Text style={styles.legendText}>Today</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeCalendarButton}
                onPress={() => setShowCalendar(false)}
              >
                <Text style={styles.closeCalendarText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // 🔍 Render each note
  const renderItem = ({ item }: any) => (
    <Pressable
      style={({ pressed }) => [
        styles.entryBox,
        pressed && styles.entryBoxPressed
      ]}
    >
      <View style={styles.noteHeader}>
        <View style={styles.noteTypeContainer}>
          <View style={[styles.noteBadge, item.type === 'text' ? styles.textBadge : styles.imageBadge]}>
            <Text style={styles.badgeText}>{item.type === 'text' ? 'TEXT' : 'IMAGE'}</Text>
          </View>
          {item.timestamp && (
            <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNote(item.id)}
        >
          <Text style={styles.deleteIcon}>×</Text>
        </TouchableOpacity>
      </View>

      {item.type === 'text' ? (
        <Text style={styles.textNote}>{item.content}</Text>
      ) : (
        <View>
          <Image
            source={{ uri: `data:image/jpeg;base64,${item.content}` }}
            style={styles.imageNote}
          />
          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={openStreamlit}
            activeOpacity={0.8}
          >
            <View style={styles.analyzeContent}>
              <View style={styles.analyzeIcon}>
                <Text style={styles.analyzeIconText}>AI</Text>
              </View>
              <Text style={styles.analyzeText}>Analyze with AI</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingSpinner}>
          <Text style={styles.loadingText}>Loading</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0e1a" />
      {renderCalendar()}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>
              <View style={styles.titleSection}>
                <View style={styles.titleAccent} />
                <View>
                  <Text style={styles.title}>Medical Notes</Text>
                  <Text style={styles.subtitle}>Secure • Offline • Private</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.calendarButton}
              onPress={() => setShowCalendar(true)}
              activeOpacity={0.7}
            >
              <View style={styles.calendarButtonContent}>
                <View style={styles.calendarIconContainer}>
                  <View style={styles.calendarIconTop} />
                  <View style={styles.calendarIconBody}>
                    <View style={styles.calendarIconDot} />
                    <View style={styles.calendarIconDot} />
                    <View style={styles.calendarIconDot} />
                  </View>
                </View>
                <Text style={styles.calendarButtonText}>View Calendar</Text>
                {Object.keys(markedDates).length > 0 && (
                  <View style={styles.calendarBadge}>
                    <Text style={styles.calendarBadgeText}>{Object.keys(markedDates).length}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <View style={[
              styles.inputContainer,
              focusedInput && styles.inputContainerFocused
            ]}>
              <TextInput
                value={text}
                onChangeText={setText}
                onFocus={() => setFocusedInput(true)}
                onBlur={() => setFocusedInput(false)}
                placeholder="Type your medical note here..."
                placeholderTextColor="#6b7280"
                style={styles.input}
                editable={!isPicking}
                multiline
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.textButton]}
                onPress={addTextNote}
                disabled={isPicking || !text.trim()}
                activeOpacity={0.7}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.buttonIconContainer}>
                    <Text style={styles.buttonIconSymbol}>+</Text>
                  </View>
                  <Text style={styles.buttonText}>Add Text</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.imageButton]}
                onPress={addImageNote}
                disabled={isPicking}
                activeOpacity={0.7}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.buttonIconContainer}>
                    <View style={styles.cameraIcon}>
                      <View style={styles.cameraLens} />
                    </View>
                  </View>
                  <Text style={styles.buttonText}>Add Image</Text>
                </View>
              </TouchableOpacity>
            </View>

            {entries.length > 0 && (
              <View style={styles.statsBar}>
                <Text style={styles.statsText}>Total Notes: {entries.length}</Text>
                <View style={styles.statsDivider} />
                <Text style={styles.statsText}>
                  {entries.filter(e => e.type === 'text').length} Text • {entries.filter(e => e.type === 'image').length} Images
                </Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <View style={styles.emptyIconCircle}>
                <View style={styles.emptyIconPlus} />
              </View>
            </View>
            <Text style={styles.emptyText}>No Notes Yet</Text>
            <Text style={styles.emptySubtext}>Start documenting your medical observations</Text>
          </View>
        }
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0e1a',
  },
  loadingSpinner: {
    padding: 30,
  },
  loadingText: {
    fontSize: 18,
    color: '#60a5fa',
    fontWeight: '600',
    letterSpacing: 2,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#111827',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: '#f9fafb',
    fontSize: 24,
    fontWeight: '700',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleAccent: {
    width: 4,
    height: 50,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
    marginRight: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f9fafb',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  inputContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#374151',
    transition: 'all 0.3s',
  },
  inputContainerFocused: {
    borderColor: '#3b82f6',
    backgroundColor: '#1a2332',
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: '#f9fafb',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
  },
  textButton: {
    backgroundColor: '#1e3a8a',
    borderColor: '#3b82f6',
  },
  imageButton: {
    backgroundColor: '#064e3b',
    borderColor: '#10b981',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIconSymbol: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '300',
  },
  cameraIcon: {
    width: 20,
    height: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLens: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    marginTop: 4,
  },
  statsText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '500',
  },
  statsDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#374151',
    marginHorizontal: 12,
  },
  entryBox: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#1f2937',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  entryBoxPressed: {
    backgroundColor: '#252f3f',
    transform: [{ scale: 0.98 }],
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  noteTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  noteBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  textBadge: {
    backgroundColor: '#1e40af',
  },
  imageBadge: {
    backgroundColor: '#065f46',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  timestamp: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    color: '#ef4444',
    fontSize: 24,
    fontWeight: '300',
  },
  textNote: {
    fontSize: 16,
    color: '#e5e7eb',
    lineHeight: 24,
  },
  imageNote: {
    width: '100%',
    height: 240,
    borderRadius: 14,
    resizeMode: 'cover',
    marginBottom: 14,
    backgroundColor: '#374151',
  },
  analyzeButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a78bfa',
  },
  analyzeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  analyzeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#a78bfa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzeIconText: {
    color: '#1f2937',
    fontSize: 12,
    fontWeight: '800',
  },
  analyzeText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1f2937',
    borderWidth: 2,
    borderColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconPlus: {
    width: 32,
    height: 4,
    backgroundColor: '#6b7280',
    borderRadius: 2,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  calendarButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#a78bfa',
    marginBottom: 16,
  },
  calendarButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  calendarIconContainer: {
    width: 24,
    height: 24,
  },
  calendarIconTop: {
    width: 24,
    height: 4,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  calendarIconBody: {
    width: 24,
    height: 18,
    backgroundColor: '#a78bfa',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 3,
    gap: 2,
  },
  calendarIconDot: {
    width: 3,
    height: 3,
    backgroundColor: '#7c3aed',
    borderRadius: 1.5,
  },
  calendarButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  calendarBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  calendarBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarModal: {
    backgroundColor: '#1f2937',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#374151',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  calendarNavButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarNavText: {
    color: '#f9fafb',
    fontSize: 20,
    fontWeight: '700',
  },
  calendarTitle: {
    color: '#f9fafb',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  calendarDayNames: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 15,
    paddingBottom: 10,
  },
  calendarDayName: {
    flex: 1,
    alignItems: 'center',
  },
  calendarDayNameText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 5,
  },
  calendarDayActive: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayMarked: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: '#10b981',
    borderRadius: 8,
  },
  calendarDayText: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '500',
  },
  calendarDayTextMarked: {
    color: '#ffffff',
    fontWeight: '700',
  },
  calendarDayTextToday: {
    color: '#10b981',
    fontWeight: '700',
  },
  calendarFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendDotMarked: {
    backgroundColor: '#3b82f6',
  },
  legendDotToday: {
    backgroundColor: '#1f2937',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  legendText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  closeCalendarButton: {
    backgroundColor: '#374151',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeCalendarText: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '600',
  },
});