import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, FlatList, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function DoctorNotes() {
  const [entries, setEntries] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('doctor_notes');
      if (stored) setEntries(JSON.parse(stored));
      setLoading(false);
    })();
  }, []);

  const saveEntries = async (newEntries: any[]) => {
    setEntries(newEntries);
    await AsyncStorage.setItem('doctor_notes', JSON.stringify(newEntries));
  };

  const addTextNote = () => {
    if (!text.trim()) return;
    const newEntry = { id: Date.now().toString(), type: 'text', content: text };
    const newEntries = [newEntry, ...entries];
    saveEntries(newEntries);
    setText('');
  };

  const addImageNote = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
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
      saveEntries(newEntries);
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.entryBox}>
      {item.type === 'text' ? (
        <Text style={styles.textNote}>{item.content}</Text>
      ) : (
        <Image
          source={{ uri: `data:image/jpeg;base64,${item.content}` }}
          style={styles.imageNote}
        />
      )}
    </View>
  );

  if (loading) return <Text>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Doctor’s Offline Notes</Text>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Enter a text note..."
        style={styles.input}
      />

      <View style={styles.buttonRow}>
        <Button title="Add Text" onPress={addTextNote} />
        <Button title="Add Image" onPress={addImageNote} />
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
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
});
