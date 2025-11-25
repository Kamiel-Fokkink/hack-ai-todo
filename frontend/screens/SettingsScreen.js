import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Modal } from 'react-native';
import UserDataService from '../services/UserDataService';
import LevelSelector from '../utils/LevelSelector';
import { getLanguageFlag, renderLevelDots } from '../utils/languageUtils';

export default function SettingsScreen() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Language modal state
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [modalLanguage, setModalLanguage] = useState('');
  const [modalLevel, setModalLevel] = useState('Basic');

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const data = await UserDataService.getUserData();
      setName(data.name || '');
      setSurname(data.surname || '');
      setLanguages(data.languages || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const success = await UserDataService.saveUserData({ name, surname, languages });
      
      if (success) {
        Alert.alert('Success', 'Settings saved successfully!');
      } else {
        Alert.alert('Error', 'Failed to save settings');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const openAddLanguageModal = () => {
    setEditingIndex(null);
    setModalLanguage('');
    setModalLevel('Basic');
    setShowLanguageModal(true);
  };

  const openEditLanguageModal = (index) => {
    setEditingIndex(index);
    setModalLanguage(languages[index].language);
    setModalLevel(languages[index].level);
    setShowLanguageModal(true);
  };

  const handleSaveLanguage = async () => {
    if (!modalLanguage.trim()) {
      Alert.alert('Error', 'Please enter a language');
      return;
    }

    // Check for duplicates (excluding current item when editing)
    const isDuplicate = languages.some((lang, index) => 
      lang.language.toLowerCase() === modalLanguage.trim().toLowerCase() && index !== editingIndex
    );

    if (isDuplicate) {
      Alert.alert('Error', 'This language has already been added');
      return;
    }

    const newLanguage = {
      language: modalLanguage.trim(),
      level: modalLevel
    };

    let updatedLanguages;
    if (editingIndex !== null) {
      // Update existing language
      updatedLanguages = [...languages];
      updatedLanguages[editingIndex] = newLanguage;
    } else {
      // Add new language
      updatedLanguages = [...languages, newLanguage];
    }

    setLanguages(updatedLanguages);
    setShowLanguageModal(false);

    // Auto-save to persist changes immediately
    try {
      await UserDataService.saveUserData({ name, surname, languages: updatedLanguages });
    } catch (error) {
      console.error('Error auto-saving language:', error);
      Alert.alert('Error', 'Failed to save language changes');
    }
  };

  const handleDeleteLanguage = (index) => {
    Alert.alert(
      'Delete Language',
      `Are you sure you want to delete ${languages[index].language}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedLanguages = languages.filter((_, i) => i !== index);
            setLanguages(updatedLanguages);
            
            // Auto-save to persist changes immediately
            try {
              await UserDataService.saveUserData({ name, surname, languages: updatedLanguages });
            } catch (error) {
              console.error('Error auto-saving after delete:', error);
              Alert.alert('Error', 'Failed to save changes');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      {/* Personal Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#999"
          />
          
          <Text style={styles.label}>Surname</Text>
          <TextInput
            style={styles.input}
            value={surname}
            onChangeText={setSurname}
            placeholder="Enter your surname"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Languages Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Languages</Text>
        <View style={styles.formContainer}>
          {languages.map((lang, index) => (
            <View key={index} style={styles.languageItem}>
              <View style={styles.languageInfo}>
                <View style={styles.languageNameContainer}>
                  <Text style={styles.languageFlag}>{getLanguageFlag(lang.language)}</Text>
                  <Text style={styles.languageName}>{lang.language}</Text>
                </View>
                <View style={styles.languageLevelContainer}>
                  {renderLevelDots(lang.level, {
                    container: styles.dotsContainer,
                    dot: styles.dot,
                    dotFilled: styles.dotFilled,
                  })}
                </View>
              </View>
              <View style={styles.languageActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditLanguageModal(index)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteLanguage(index)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddLanguageModal}
          >
            <Text style={styles.addButtonText}>+ Add Language</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity 
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save All Settings</Text>
        )}
      </TouchableOpacity>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingIndex !== null ? 'Edit Language' : 'Add Language'}
            </Text>

            <View style={styles.flagsRow}>
              <Text style={styles.flagIcon}>🇬🇧</Text>
              <Text style={styles.flagIcon}>🇪🇸</Text>
              <Text style={styles.flagIcon}>🇳🇱</Text>
              <Text style={styles.flagIcon}>🇵🇱</Text>
              <Text style={styles.flagIcon}>🇩🇪</Text>
              <Text style={styles.flagIcon}>🇫🇷</Text>
            </View>
            <TextInput
              style={styles.input}
              value={modalLanguage}
              onChangeText={setModalLanguage}
              placeholder="e.g., English, Spanish, Dutch"
              placeholderTextColor="#999"
            />

            <LevelSelector
              selectedLevel={modalLevel}
              onLevelChange={setModalLevel}
              style={styles.levelSelectorContainer}
              showIcon={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLanguageModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSaveLanguage}
              >
                <Text style={styles.confirmButtonText}>
                  {editingIndex !== null ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    paddingHorizontal: 20,
    color: '#555',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  languageInfo: {
    flex: 1,
    gap: 8,
  },
  languageNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageFlag: {
    fontSize: 20,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  languageLevelContainer: {
    marginLeft: 28,
  },
  dotsContainer: {
    gap: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotFilled: {
    backgroundColor: '#666',
    borderColor: '#666',
  },
  languageActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    margin: 20,
    marginTop: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#999',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  flagsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
    paddingVertical: 8,
  },
  flagIcon: {
    fontSize: 28,
  },
  levelSelectorContainer: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

