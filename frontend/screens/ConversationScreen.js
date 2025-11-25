import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Animated, Easing, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';
import UserDataService from '../services/UserDataService';
import HelpService from '../services/HelpService';
import { jsonToMarkdown } from '../utils/jsonToMarkdown';
import { getLanguageFlag, renderLevelDots } from '../utils/languageUtils';

export default function ConversationScreen() {
  const [userData, setUserData] = useState({ name: '', surname: '', languages: [] });
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

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


  // Handle voice recording press
  const handleRecordPress = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      // Stop animation by resetting scale
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      console.log('User finished speaking (simulated)');
    } else {
      // Start recording
      setIsRecording(true);
      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
      console.log('User started speaking (simulated)');
    }
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
              <Text style={styles.getHelpButtonText}>Start</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.languageSelector}
              onPress={() => setShowLanguageModal(true)}
            >
              {selectedLanguage ? (
                <View style={styles.languageSelectorContent}>
                  <Text style={styles.flagEmoji}>{getLanguageFlag(selectedLanguage.language)}</Text>
                  {renderLevelDots(selectedLanguage.level, {
                    container: styles.dotsContainerInline,
                    dot: styles.dotInline,
                    dotFilled: styles.dotFilledInline,
                  })}
                </View>
              ) : (
                <Text style={styles.languageSelectorText}>Select</Text>
              )}
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

          {/* Voice Recording Section */}
          <View style={styles.recordingContainer}>
            <Animated.View style={[styles.aiEmojiContainer, { transform: [{ scale: scaleAnim }] }] }>
              <Text style={styles.aiEmoji}>🤖</Text>
            </Animated.View>
            <TouchableOpacity
              style={styles.recordButton}
              onPress={handleRecordPress}
            >
              <Text style={styles.recordButtonText}>{isRecording ? 'Stop' : 'Record'}</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text style={styles.noLanguagesText}>
          Add languages in Settings to get help
        </Text>
      )}

      {/* Language Selection Modal */}
      {/* Modal remains unchanged */}
      {showLanguageModal && (
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
                <View style={styles.languageOptionContent}>
                  <Text style={styles.languageOptionFlag}>{getLanguageFlag(lang.language)}</Text>
                  <Text style={[
                    styles.languageOptionText,
                    selectedLanguage?.language === lang.language && styles.languageOptionTextSelected
                  ]}>
                    {lang.language}
                  </Text>
                </View>
                {renderLevelDots(lang.level, {
                  container: styles.dotsContainerModal,
                  dot: styles.dotModal,
                  dotFilled: selectedLanguage?.language === lang.language ? styles.dotFilledModalSelected : styles.dotFilledModal,
                })}
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
      )}
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
    minWidth: 100,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
  },
  languageSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flagEmoji: {
    fontSize: 24,
  },
  languageSelectorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dotsContainerInline: {
    gap: 3,
  },
  dotInline: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotFilledInline: {
    backgroundColor: '#fff',
    borderColor: '#fff',
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
  languageOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageOptionFlag: {
    fontSize: 24,
  },
  languageOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  languageOptionTextSelected: {
    color: '#fff',
  },
  dotsContainerModal: {
    gap: 4,
  },
  dotModal: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotFilledModal: {
    backgroundColor: '#666',
    borderColor: '#666',
  },
  dotFilledModalSelected: {
    backgroundColor: '#fff',
    borderColor: '#fff',
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
  // New styles for voice recording UI
  recordingContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  aiEmojiContainer: {
    marginBottom: 20,
  },
  aiEmoji: {
    fontSize: 64,
  },
  recordButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
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

