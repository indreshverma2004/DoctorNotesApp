import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = () => {
    if (username === 'doctor' && password === '1234') {
      router.push('/patients'); // doctor → patient list
    } else if (username === 'patient' && password === '1234') {
      router.push('/PatientView'); // patient → view-only notes
    } else {
      Alert.alert('Invalid Credentials', 'Use:\nDoctor → doctor / 1234\nPatient → patient / 0000');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0e1a" />
      
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <View style={styles.logoCross} />
              <View style={[styles.logoCross, styles.logoCrossHorizontal]} />
            </View>
          </View>
          <Text style={styles.title}>Medical Portal</Text>
          <Text style={styles.subtitle}>Secure Access for Healthcare Professionals</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Username</Text>
            <View style={[
              styles.inputContainer,
              focusedField === 'username' && styles.inputContainerFocused,
              error && styles.inputContainerError
            ]}>
              <View style={styles.inputIcon}>
                <View style={styles.userIcon}>
                  <View style={styles.userIconHead} />
                  <View style={styles.userIconBody} />
                </View>
              </View>
              <TextInput
                value={username}
                onChangeText={setUsername}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter username"
                placeholderTextColor="#6b7280"
                style={styles.input}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <View style={[
              styles.inputContainer,
              focusedField === 'password' && styles.inputContainerFocused,
              error && styles.inputContainerError
            ]}>
              <View style={styles.inputIcon}>
                <View style={styles.lockIcon}>
                  <View style={styles.lockBody} />
                  <View style={styles.lockShackle} />
                </View>
              </View>
              <TextInput
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter password"
                placeholderTextColor="#6b7280"
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <View style={styles.errorIcon}>
                <Text style={styles.errorIconText}>!</Text>
              </View>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
            <View style={styles.arrowIcon}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.hintContainer}>
            <View style={styles.hintDot} />
            <Text style={styles.hintText}>Demo: doctor / 1234</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.securityBadge}>
            <View style={styles.shieldIcon}>
              <View style={styles.shieldCheck} />
            </View>
            <Text style={styles.securityText}>Encrypted Connection</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 80,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1f2937',
    borderWidth: 2,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoCross: {
    width: 4,
    height: 32,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
    position: 'absolute',
  },
  logoCrossHorizontal: {
    width: 32,
    height: 4,
    transform: [{ rotate: '90deg' }],
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  inputWrapper: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#374151',
    paddingHorizontal: 16,
    height: 56,
  },
  inputContainerFocused: {
    borderColor: '#3b82f6',
    backgroundColor: '#1a2332',
  },
  inputContainerError: {
    borderColor: '#ef4444',
  },
  inputIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userIcon: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  userIconHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
    position: 'absolute',
    top: 0,
    left: 6,
  },
  userIconBody: {
    width: 16,
    height: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#9ca3af',
    position: 'absolute',
    bottom: 0,
    left: 2,
  },
  lockIcon: {
    width: 18,
    height: 20,
    position: 'relative',
  },
  lockBody: {
    width: 18,
    height: 12,
    backgroundColor: '#9ca3af',
    borderRadius: 3,
    position: 'absolute',
    bottom: 0,
  },
  lockShackle: {
    width: 12,
    height: 10,
    borderWidth: 2,
    borderColor: '#9ca3af',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomWidth: 0,
    position: 'absolute',
    top: 0,
    left: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#f9fafb',
    height: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7f1d1d',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  errorIconText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#60a5fa',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  arrowIcon: {
    marginLeft: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#60a5fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  hintDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6b7280',
    marginRight: 8,
  },
  hintText: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  shieldIcon: {
    width: 18,
    height: 20,
    marginRight: 8,
    position: 'relative',
  },
  shieldCheck: {
    width: 14,
    height: 16,
    borderWidth: 2,
    borderColor: '#10b981',
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderBottomWidth: 0,
  },
  securityText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});