import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { renderTextWithLargeEmojis } from './emojiRenderer';

/**
 * Renders text with checkboxes for tasks
 * Each non-empty line becomes a checkable task
 * Entire row is clickable (checkbox + text)
 */
export default function TaskChecklistRenderer({ text, style, checkedItems = {}, onToggle }) {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return (
    <View style={styles.container}>
      {lines.map((line, index) => {
        const isChecked = checkedItems[index] || false;

        return (
          <TouchableOpacity
            key={index}
            style={styles.taskItem}
            onPress={() => onToggle && onToggle(index)}
            activeOpacity={0.7}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isChecked }}
          >
            <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
              {isChecked && <Text style={[styles.checkmark, styles.checkmarkChecked]}>✓</Text>}
            </View>

            <View style={[styles.taskTextContainer, isChecked && styles.taskTextContainerChecked]}>
              {renderTextWithLargeEmojis(
                line,
                [style, isChecked && styles.taskTextChecked]
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/**
 * Renders array items with checkboxes
 * Entire row is clickable
 */
export function TaskChecklistArray({ items, style, checkedItems = {}, onToggle }) {
  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const isChecked = checkedItems[index] || false;

        return (
          <TouchableOpacity
            key={index}
            style={styles.taskItem}
            onPress={() => onToggle && onToggle(index)}
            activeOpacity={0.7}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isChecked }}
          >
            <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
              {isChecked && <Text style={[styles.checkmark, styles.checkmarkChecked]}>✓</Text>}
            </View>

            <View style={[styles.taskTextContainer, isChecked && styles.taskTextContainerChecked]}>
              {renderTextWithLargeEmojis(
                String(item),
                [style, isChecked && styles.taskTextChecked]
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/**
 * Renders nested object values with checkboxes (keys remain as labels)
 * Each value row clickable
 */
export function TaskChecklistNested({ object, keyStyle, valueStyle, checkedItems = {}, onToggle }) {
  return (
    <View style={styles.nestedContainer}>
      {Object.keys(object).map((key) => {
        const value = object[key];
        const isChecked = checkedItems[key] || false;

        return (
          <View key={key} style={styles.nestedItem}>
            <Text style={keyStyle}>{key}:</Text>

            <TouchableOpacity
              style={styles.taskItem}
              onPress={() => onToggle && onToggle(key)}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isChecked }}
            >
              <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                {isChecked && <Text style={[styles.checkmark, styles.checkmarkChecked]}>✓</Text>}
              </View>

              <View style={[styles.taskTextContainer, isChecked && styles.taskTextContainerChecked]}>
                {renderTextWithLargeEmojis(
                  String(value),
                  [valueStyle, isChecked && styles.taskTextChecked]
                )}
              </View>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#A9C8AA',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    borderColor: '#3A6F3A',
    backgroundColor: '#DFF2DF',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B99724',
  },
  checkmarkChecked: {
    color: '#3A6F3A',
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTextContainerChecked: {
    opacity: 0.55,
  },
  taskTextChecked: {
    textDecorationLine: 'line-through',
    color: '#667066',
  },
  nestedContainer: {
    marginTop: 8,
  },
  nestedItem: {
    marginBottom: 12,
  },
});
