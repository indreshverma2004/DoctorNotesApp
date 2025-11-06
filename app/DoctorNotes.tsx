import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';

export default function DoctorNotes() {
  const [entries, setEntries] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPicking, setIsPicking] = useState(false);

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
    const newEntry = { id: Date.now().toString(), type: 'text', content: text };
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

  // 🌐 Open Streamlit app
  const openStreamlit = async () => {
    const streamlitUrl = 'https://lesion-classification.streamlit.app/';
    await WebBrowser.openBrowserAsync(streamlitUrl);
  };

  // 🔍 Render each note
  const renderItem = ({ item }: any) => (
    <View style={styles.entryBox}>
      {item.type === 'text' ? (
        <Text style={styles.textNote}>{item.content}</Text>
      ) : (
        <View>
          <Image
            source={{ uri: `data:image/jpeg;base64,${item.content}` }}
            style={styles.imageNote}
          />
          <TouchableOpacity style={styles.analyzeButton} onPress={openStreamlit}>
            <Text style={styles.analyzeText}>Analyze Image</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) return <Text>Loading...</Text>;

  return (
    <FlatList
      data={entries}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>Doctor’s Offline Notes</Text>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Enter a text note..."
            style={styles.input}
            editable={!isPicking}
          />

          <View style={styles.buttonRow}>
            <Button title="Add Text" onPress={addTextNote} disabled={isPicking} />
            <Button title="Add Image" onPress={addImageNote} disabled={isPicking} />
          </View>
        </View>
      }
      contentContainerStyle={{ padding: 20, backgroundColor: '#fff', paddingBottom: 100 }}
    />
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  entryBox: {
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
  },
  textNote: { fontSize: 16, color: '#333' },
  imageNote: { width: '100%', height: 200, borderRadius: 8, resizeMode: 'cover' },
  analyzeButton: {
    backgroundColor: '#238636',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  analyzeText: { color: 'white', fontWeight: 'bold' },
});
