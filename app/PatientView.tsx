import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, StatusBar, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PatientView() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🧠 Load doctor's saved notes
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('doctor_notes');
      if (stored) setEntries(JSON.parse(stored));
      setLoading(false);
    })();
  }, []);

  // Format timestamp
  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
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

  const renderItem = ({ item }: any) => (
    <Pressable
      style={({ pressed }) => [
        styles.noteCard,
        pressed && styles.noteCardPressed
      ]}
    >
      <View style={styles.noteHeader}>
        <View style={[styles.noteBadge, item.type === 'text' ? styles.textBadge : styles.imageBadge]}>
          <Text style={styles.badgeText}>{item.type === 'text' ? 'TEXT' : 'IMAGE'}</Text>
        </View>
        {item.timestamp && (
          <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
        )}
      </View>

      {item.type === 'text' ? (
        <Text style={styles.textNote}>{item.content}</Text>
      ) : (
        <Image
          source={{ uri: `data:image/jpeg;base64,${item.content}` }}
          style={styles.imageNote}
        />
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
      
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <View style={styles.titleAccent} />
          <View>
            <Text style={styles.title}>Your Medical Records</Text>
            <Text style={styles.subtitle}>View your health documentation</Text>
          </View>
        </View>

        {entries.length > 0 && (
          <View style={styles.statsBar}>
            <Text style={styles.statsText}>Total Records: {entries.length}</Text>
            <View style={styles.statsDivider} />
            <Text style={styles.statsText}>
              {entries.filter(e => e.type === 'text').length} Text • {entries.filter(e => e.type === 'image').length} Images
            </Text>
          </View>
        )}
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <View style={styles.emptyIconCircle}>
              <View style={styles.emptyIconPlus} />
            </View>
          </View>
          <Text style={styles.emptyText}>No Records Yet</Text>
          <Text style={styles.emptySubtext}>Your doctor hasn't added any medical records for you</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  header: {
    backgroundColor: '#111827',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#1f2937',
    borderRadius: 12,
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
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  noteCard: {
    backgroundColor: '#1f2937',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  noteCardPressed: {
    backgroundColor: '#252f3f',
    transform: [{ scale: 0.98 }],
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    backgroundColor: '#374151',
  },
  emptyState: {
    flex: 1,
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
});