import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Maps language names to flag emojis
 */
const LANGUAGE_FLAGS = {
  'english': '🇬🇧',
  'spanish': '🇪🇸',
  'dutch': '🇳🇱',
  'netherlands': '🇳🇱',
  'polish': '🇵🇱',
  'german': '🇩🇪',
  'french': '🇫🇷',
  // Alternative spellings
  'español': '🇪🇸',
  'nederlands': '🇳🇱',
  'inglés': '🇬🇧',
  'polski': '🇵🇱',
  'deutsch': '🇩🇪',
  'français': '🇫🇷',
  'allemand': '🇩🇪',
  'francés': '🇫🇷',
  'alemán': '🇩🇪',
};

/**
 * Get flag emoji for a language
 */
export function getLanguageFlag(language) {
  if (!language) return '🌐';
  const normalized = language.toLowerCase().trim();
  return LANGUAGE_FLAGS[normalized] || '🌐';
}

/**
 * Get number of dots for a level
 */
export function getLevelDots(level) {
  const dotMap = {
    'Basic': 1,
    'Intermediate': 2,
    'Fluent': 3,
  };
  return dotMap[level] || 1;
}

/**
 * Render dots inline for a given level
 */
export function renderLevelDots(level, styles = {}) {
  const dotCount = getLevelDots(level);

  return (
    <View style={[internalStyles.dotsContainer, styles.container]}>
      {[1, 2, 3].map((dotNumber) => (
        <View
          key={dotNumber}
          style={[
            internalStyles.dot,
            styles.dot,
            dotNumber <= dotCount && internalStyles.dotFilled,
            dotNumber <= dotCount && styles.dotFilled,
          ]}
        />
      ))}
    </View>
  );
}

const internalStyles = StyleSheet.create({
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    borderWidth: 1,
    borderColor: '#bbb',
  },
  dotFilled: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
});
