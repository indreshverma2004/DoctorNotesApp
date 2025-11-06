import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const patients = [
  { id: '1', name: 'Ravi Kumar', age: 42, condition: 'Skin Lesion - Left Arm' },
  { id: '2', name: 'Priya Sharma', age: 36, condition: 'Mole - Neck Region' },
  { id: '3', name: 'Anil Mehta', age: 58, condition: 'Pigmented Lesion - Back' },
  { id: '4', name: 'Sneha Gupta', age: 29, condition: 'Dark Spot - Shoulder' },
];

export default function PatientsList() {
  const router = useRouter();

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/DoctorNotes', params: { patientId: item.id } })}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.details}>Age: {item.age}</Text>
      <Text style={styles.details}>{item.condition}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👩‍⚕️ Patient List</Text>
      <FlatList
        data={patients}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 15, color: '#0a3d62', textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  name: { fontSize: 18, fontWeight: '600', color: '#222' },
  details: { color: '#555', marginTop: 4 },
});
