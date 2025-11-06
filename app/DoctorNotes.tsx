import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, FlatList, StyleSheet, TouchableOpacity, StatusBar, Animated, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';

export default function DoctorNotes() {
  const [entries, setEntries] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPicking, setIsPicking] = useState(false);
  const [focusedInput, setFocusedInput] = useState(false);

  // 🧠 Load saved notes
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('doctor_notes');
      if (stored) setEntries(JSON.parse(stored));
      setLoading(false);
    })();
  }, []);

  // 💾 Save locally
  const saveEntries = async (newEntries: any[]) => {
    setEntries(newEntries);
    await AsyncStorage.setItem('doctor_notes', JSON.stringify(newEntries));
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
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <View style={styles.titleAccent} />
              <View>
                <Text style={styles.title}>Medical Notes</Text>
                <Text style={styles.subtitle}>Secure • Offline • Private</Text>
              </View>
            </View>

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
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
});