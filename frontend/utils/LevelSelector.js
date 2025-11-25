import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const LEVELS = [
  { value: 'Basic', dots: 1, label: 'Basic' },
  { value: 'Intermediate', dots: 2, label: 'Intermediate' },
  { value: 'Fluent', dots: 3, label: 'Fluent' },
];

/**
 * Visual level selector with dots (language-agnostic)
 * Shows speaking face + speech bubble icon with dot indicators
 */
export default function LevelSelector({ selectedLevel, onLevelChange, style, showIcon = true }) {
  return (
    <View style={[styles.container, style]}>
      {/* Icon Row (optional) */}
      {showIcon && (
        <View style={styles.iconRow}>
          <Text style={styles.iconText}>🗣️💬</Text>
        </View>
      )}

      {/* Level Options Row */}
      <View style={styles.levelsRow}>
        {LEVELS.map((level) => (
          <TouchableOpacity
            key={level.value}
            style={[
              styles.levelOption,
              selectedLevel === level.value && styles.levelOptionSelected,
            ]}
            onPress={() => onLevelChange(level.value)}
            activeOpacity={0.7}
          >
            {/* Dots */}
            <View style={styles.dotsContainer}>
              {[1, 2, 3].map((dotNumber) => (
                <View
                  key={dotNumber}
                  style={[
                    styles.dot,
                    dotNumber <= level.dots && styles.dotFilled,
                    selectedLevel === level.value && dotNumber <= level.dots && styles.dotFilledSelected,
                  ]}
                />
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  iconRow: {
    marginBottom: 16,
  },
  iconText: {
    fontSize: 32,
  },
  levelsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  levelOption: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 70,
  },
  levelOptionSelected: {
    backgroundColor: '#E5F3FF',
    borderColor: '#478FEB',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ddd',
    borderWidth: 1.5,
    borderColor: '#bbb',
  },
  dotFilled: {
    backgroundColor: '#666',
    borderColor: '#666',
  },
  dotFilledSelected: {
    backgroundColor: '#478FEB',
    borderColor: '#478FEB',
  },
});
