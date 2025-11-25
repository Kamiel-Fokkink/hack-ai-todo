import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, Alert, ScrollView, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import UserDataService from '../services/UserDataService';
import HelpService from '../services/HelpService';
import ExpandableJsonBlocks from '../utils/ExpandableJsonBlock';
import { getLanguageFlag, renderLevelDots } from '../utils/languageUtils';

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

  // Auto-fetch help when language is selected
  useEffect(() => {
    if (selectedLanguage) {
      handleGetHelp();
    }
  }, [selectedLanguage]);

  const handleGetHelp = async () => {
    if (!selectedLanguage) return;

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
      // Optional: Don't show alert on auto-fetch failure to avoid annoyance, or show a subtle error
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLanguage = (language) => {
    setSelectedLanguage(language);
    setShowLanguageModal(false);
  };

  if (loading && !userData.languages) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#478FEB" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.greeting}>{getGreeting()}</Text>
      
      {userData.languages && userData.languages.length > 0 ? (
        <>
          {/* Display API Response Inline or Skeleton */}
          {loading ? (
            <SkeletonLoader />
          ) : apiResponse ? (
            <View style={styles.responseContainer}>
              <ExpandableJsonBlocks
                jsonData={apiResponse.content || apiResponse}
                taskClassification={apiResponse.task_classification || {}}
              />
            </View>
          ) : null}
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
  logo: {
    width: 120,
    height: 120,
    marginTop: 20,
    marginBottom: 10,
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
    backgroundColor: '#478FEB',
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
    backgroundColor: '#3D7BC7',
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
    backgroundColor: '#478FEB',
    borderColor: '#478FEB',
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
    marginTop: 20,
    width: '100%',
  },
  skeletonContainer: {
    width: '100%',
    marginTop: 20,
    gap: 15,
  },
  skeletonBlock: {
    height: 100,
    backgroundColor: '#E1E9EE',
    borderRadius: 12,
    width: '100%',
  },
  skeletonLine: {
    height: 20,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
    marginBottom: 10,
    width: '60%',
  },
});

const SkeletonLoader = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.skeletonContainer}>
      <Animated.View style={[styles.skeletonLine, { opacity, width: '40%', alignSelf: 'center', marginBottom: 20 }]} />
      {[1, 2, 3].map((i) => (
        <Animated.View key={i} style={[styles.skeletonBlock, { opacity }]} />
      ))}
    </View>
  );
};
