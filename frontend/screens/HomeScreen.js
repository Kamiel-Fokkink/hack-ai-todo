import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';
import UserDataService from '../services/UserDataService';
import HelpService from '../services/HelpService';
import { jsonToMarkdown } from '../utils/jsonToMarkdown';

export default function HomeScreen() {
  const [userData, setUserData] = useState({ name: '', surname: '', languages: [] });
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  // Load user data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      setLoading(true);
      const data = await UserDataService.getUserData();
      setUserData(data);
      
      // Set default language to first one if available
      if (data.languages && data.languages.length > 0 && !selectedLanguage) {
        setSelectedLanguage(data.languages[0]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const fullName = `${userData.name} ${userData.surname}`.trim();
    return fullName ? `Hello, ${fullName}!` : 'Hello!';
  };

  const handleGetHelp = async () => {
    if (!selectedLanguage) {
      Alert.alert('Error', 'Please add a language in Settings first!');
      return;
    }

    try {
      setLoading(true);
      
      const response = await HelpService.requestHelp(
        selectedLanguage.language,
        selectedLanguage.level
      );

      // Store the response to display inline
      setApiResponse(response);

    } catch (error) {
      console.error('Error in handleGetHelp:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLanguage = (language) => {
    setSelectedLanguage(language);
    setShowLanguageModal(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.greeting}>{getGreeting()}</Text>
      
      {userData.languages && userData.languages.length > 0 ? (
        <>
          <View style={styles.helpSection}>
            <TouchableOpacity 
              style={styles.getHelpButton}
              onPress={handleGetHelp}
            >
              <Text style={styles.getHelpButtonText}>Get Help</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.languageSelector}
              onPress={() => setShowLanguageModal(true)}
            >
              <View>
                <Text style={styles.languageSelectorLabel}>Language</Text>
                <Text style={styles.languageSelectorText}>
                  {selectedLanguage ? `${selectedLanguage.language} (${selectedLanguage.level})` : 'Select'}
                </Text>
              </View>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Display API Response Inline */}
          {apiResponse && (
            <View style={styles.responseContainer}>
              <Markdown style={markdownStyles}>
                {jsonToMarkdown(apiResponse)}
              </Markdown>
            </View>
          )}
        </>
      ) : (
        <Text style={styles.noLanguagesText}>
          Add languages in Settings to get help
        </Text>
      )}

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            
            {userData.languages.map((lang, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.languageOption,
                  selectedLanguage?.language === lang.language && styles.languageOptionSelected
                ]}
                onPress={() => handleSelectLanguage(lang)}
              >
                <Text style={[
                  styles.languageOptionText,
                  selectedLanguage?.language === lang.language && styles.languageOptionTextSelected
                ]}>
                  {lang.language}
                </Text>
                <Text style={[
                  styles.languageOptionLevel,
                  selectedLanguage?.language === lang.language && styles.languageOptionLevelSelected
                ]}>
                  {lang.level}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
  },
  helpSection: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 0,
    width: '100%',
    maxWidth: 400,
  },
  getHelpButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getHelpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  languageSelector: {
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 140,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
  },
  languageSelectorLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  languageSelectorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownIcon: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 'auto',
  },
  noLanguagesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
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
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  languageOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  languageOptionTextSelected: {
    color: '#fff',
  },
  languageOptionLevel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  languageOptionLevelSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  modalCloseButton: {
    marginTop: 12,
    padding: 14,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  responseContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    width: '100%',
    // maxWidth: 400,
  },
});

// Markdown-specific styles
const markdownStyles = {
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    lineHeight: 24,
  },
  bullet_list: {
    marginBottom: 12,
  },
  list_item: {
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    color: '#333',
  },
};

