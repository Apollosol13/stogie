import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { CheckSquare, Square } from 'lucide-react-native';
import { useAuthStore } from '../../utils/auth/store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://stogie-production.up.railway.app';

export default function AuthForm({ mode = 'signin', onSuccess, onModeChange }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { setAuth } = useAuthStore();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (mode === 'signup' && !termsAccepted) {
      Alert.alert('Terms Required', 'You must accept the Terms of Service to create an account');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/signin';
      const body = mode === 'signup' 
        ? { email, password, fullName, username }
        : { email, password };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (mode === 'signup') {
        // Backend now returns { session, user } on signup
        console.log('🔐 Backend signup response:', data);
        const authData = {
          jwt: data.session?.access_token,
          user: {
            id: data.user?.id,
            email: data.user?.email,
            name: data.user?.fullName || data.user?.name,
            username: data.user?.username,
            avatarUrl: data.user?.avatarUrl
          },
          expires_at: data.session?.expires_at
        };
        console.log('🔐 Storing auth data (signup):', authData);
        setAuth(authData);
        onSuccess?.();
      } else {
        // Debug what backend actually returns
        console.log('🔐 Backend signin response:', data);
        console.log('🔐 Session object:', data.session);
        console.log('🔐 Access token:', data.session?.access_token);
        console.log('🔐 User object:', data.user);
        
        // Store only the essential data to avoid SecureStore size limit
        const authData = {
          jwt: data.session?.access_token,  // Remove fallback - we want to see if this fails
          user: {
            id: data.user?.id,
            email: data.user?.email,
            name: data.user?.fullName || data.user?.name,
            username: data.user?.username,
            avatarUrl: data.user?.avatarUrl
          },
          expires_at: data.session?.expires_at
        };
        
        console.log('🔐 Storing auth data:', authData);
        console.log('🔐 JWT token exists?', !!authData.jwt);
        console.log('🔐 JWT token preview:', authData.jwt?.substring(0, 20) + '...');
        setAuth(authData);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', `${error.message}\n\nAPI URL: ${API_BASE_URL}${endpoint}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={styles.title}>
            {mode === 'signup' ? 'Create Account' : 'Sign In'}
          </Text>
          
          {mode === 'signup' && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#666"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#666"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </>
          )}
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
          
          {mode === 'signup' && (
            <TouchableOpacity
              onPress={() => setTermsAccepted(!termsAccepted)}
              style={styles.termsCheckbox}
            >
              {termsAccepted ? (
                <CheckSquare size={24} color="#D4B896" />
              ) : (
                <Square size={24} color="#666" />
              )}
              <Text style={styles.termsText}>
                I agree to the Terms of Service, including the{' '}
                <Text style={styles.termsHighlight}>zero-tolerance policy</Text>
                {' '}for objectionable content and abusive behavior
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'signup' ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.switchButton}
            onPress={() => {
              onModeChange?.(mode === 'signup' ? 'signin' : 'signup');
              setTermsAccepted(false); // Reset terms when switching modes
            }}
          >
            <Text style={styles.switchText}>
              {mode === 'signup' 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"
              }
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#1A1A1A',
    color: '#fff',
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 10,
  },
  termsText: {
    color: '#B0B0B0',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  termsHighlight: {
    color: '#FF4444',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#D4B896',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#D4B896',
    fontSize: 16,
  },
});
