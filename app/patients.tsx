import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  room: string;
  status: 'stable' | 'critical' | 'recovering';
  lastVisit: string;
}

export default function PatientsListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    router.replace('/');
  };

  const handleSelectPatient = (patientId: string) => {
    router.push({ pathname: '/DoctorNotes', params: { patientId: patientId } });
  };

  // Hardcoded patients data
  const patients: Patient[] = [
    {
      id: '1',
      name: 'Ravi Kumar',
      age: 42,
      gender: 'Male',
      condition: 'Skin Lesion - Left Arm',
      room: 'A-301',
      status: 'stable',
      lastVisit: '2h ago'
    },
    {
      id: '2',
      name: 'Priya Sharma',
      age: 36,
      gender: 'Female',
      condition: 'Mole - Neck Region',
      room: 'B-205',
      status: 'recovering',
      lastVisit: '5h ago'
    },
    {
      id: '3',
      name: 'Anil Mehta',
      age: 58,
      gender: 'Male',
      condition: 'Pigmented Lesion - Back',
      room: 'C-102',
      status: 'critical',
      lastVisit: '30m ago'
    },
    {
      id: '4',
      name: 'Sneha Gupta',
      age: 29,
      gender: 'Female',
      condition: 'Dark Spot - Shoulder',
      room: 'A-405',
      status: 'stable',
      lastVisit: '1d ago'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return '#10b981';
      case 'critical': return '#ef4444';
      case 'recovering': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'stable': return '#064e3b';
      case 'critical': return '#7f1d1d';
      case 'recovering': return '#78350f';
      default: return '#374151';
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.room.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const renderPatient = ({ item }: { item: Patient }) => (
    <Pressable
      style={({ pressed }) => [
        styles.patientCard,
        pressed && styles.patientCardPressed
      ]}
      onPress={() => handleSelectPatient(item.id)}
    >
      <View style={styles.patientHeader}>
        <View style={styles.patientInfo}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { borderColor: getStatusColor(item.status) }]}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          </View>
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>{item.name}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{item.age}y</Text>
              <View style={styles.metaDivider} />
              <Text style={styles.metaText}>{item.gender}</Text>
              <View style={styles.metaDivider} />
              <Text style={styles.metaText}>Room {item.room}</Text>
            </View>
          </View>
        </View>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrowText}>→</Text>
        </View>
      </View>

      <View style={styles.conditionContainer}>
        <View style={styles.conditionBadge}>
          <Text style={styles.conditionText}>{item.condition}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBackground(item.status) }]}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.lastVisit}>Last visit: {item.lastVisit}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0e1a" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Patients</Text>
            <Text style={styles.subtitle}>{filteredPatients.length} Active Cases</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
            <View style={styles.logoutIcon}>
              <View style={styles.logoutArrow} />
              <View style={styles.logoutDoor} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchIcon}>
            <View style={styles.searchCircle} />
            <View style={styles.searchHandle} />
          </View>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search patients, conditions, rooms..."
            placeholderTextColor="#6b7280"
            style={styles.searchInput}
          />
        </View>
      </View>

      <FlatList
        data={filteredPatients}
        keyExtractor={(item) => item.id}
        renderItem={renderPatient}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f9fafb',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  logoutArrow: {
    width: 10,
    height: 2,
    backgroundColor: '#ef4444',
    position: 'absolute',
    right: 0,
    top: 9,
  },
  logoutDoor: {
    width: 12,
    height: 16,
    borderWidth: 2,
    borderColor: '#ef4444',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#374151',
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 16,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    position: 'relative',
  },
  searchCircle: {
    width: 14,
    height: 14,
    borderWidth: 2,
    borderColor: '#9ca3af',
    borderRadius: 7,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  searchHandle: {
    width: 6,
    height: 2,
    backgroundColor: '#9ca3af',
    position: 'absolute',
    bottom: 2,
    right: 0,
    transform: [{ rotate: '45deg' }],
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#f9fafb',
    height: '100%',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  patientCard: {
    backgroundColor: '#1f2937',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  patientCardPressed: {
    backgroundColor: '#252f3f',
    transform: [{ scale: 0.98 }],
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  patientInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#374151',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#f9fafb',
    fontSize: 22,
    fontWeight: '700',
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: '#1f2937',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  patientDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  patientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '500',
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#4b5563',
    marginHorizontal: 8,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    color: '#9ca3af',
    fontSize: 18,
    fontWeight: '700',
  },
  conditionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  conditionBadge: {
    flex: 1,
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
  },
  conditionText: {
    color: '#d1d5db',
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastVisit: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
});