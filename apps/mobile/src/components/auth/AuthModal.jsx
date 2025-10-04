import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthModal } from '../../utils/auth/store';
import AuthForm from './AuthForm';

export default function AuthModal() {
  const { isOpen, mode, close } = useAuthModal();
  const [currentMode, setCurrentMode] = useState(mode);

  const handleSuccess = () => {
    close();
  };

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={close}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={close} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <AuthForm
          mode={currentMode}
          onSuccess={handleSuccess}
          onModeChange={handleModeChange}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    backgroundColor: '#000',
  },
  closeButton: {
    padding: 8,
  },
});
