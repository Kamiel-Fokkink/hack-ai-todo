import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { renderTextWithLargeEmojis } from './emojiRenderer';

/**
 * Renders text with checkboxes for tasks
 * Each non-empty line becomes a checkable task
 */
export default function TaskChecklistRenderer({ text, style }) {
  // Split by newlines and filter empty lines
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Track checked state for each line
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheckbox = (index) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <View style={styles.container}>
      {lines.map((line, index) => {
        const isChecked = checkedItems[index] || false;

        return (
          <View key={index} style={styles.taskItem}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => toggleCheckbox(index)}
              activeOpacity={0.7}
            >
              {isChecked && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <View style={[styles.taskTextContainer, isChecked && styles.taskTextContainerChecked]}>
              {renderTextWithLargeEmojis(
                line,
                [style, isChecked && styles.taskTextChecked]
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/**
 * Renders array items with checkboxes
 */
export function TaskChecklistArray({ items, style }) {
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheckbox = (index) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const isChecked = checkedItems[index] || false;

        return (
          <View key={index} style={styles.taskItem}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => toggleCheckbox(index)}
              activeOpacity={0.7}
            >
              {isChecked && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <View style={[styles.taskTextContainer, isChecked && styles.taskTextContainerChecked]}>
              {renderTextWithLargeEmojis(
                String(item),
                [style, isChecked && styles.taskTextChecked]
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/**
 * Renders nested object values with checkboxes (keys remain as labels)
 */
export function TaskChecklistNested({ object, keyStyle, valueStyle }) {
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheckbox = (key) => {
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <View style={styles.nestedContainer}>
      {Object.keys(object).map((key) => {
        const value = object[key];
        const isChecked = checkedItems[key] || false;

        return (
          <View key={key} style={styles.nestedItem}>
            <Text style={keyStyle}>{key}:</Text>

            <View style={styles.taskItem}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => toggleCheckbox(key)}
                activeOpacity={0.7}
              >
                {isChecked && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>

              <View style={[styles.taskTextContainer, isChecked && styles.taskTextContainerChecked]}>
                {renderTextWithLargeEmojis(
                  String(value),
                  [valueStyle, isChecked && styles.taskTextChecked]
                )}
              </View>
            </View>
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
    borderColor: '#F5DA5F',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4A917',
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTextContainerChecked: {
    opacity: 0.5,
  },
  taskTextChecked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  nestedContainer: {
    marginTop: 8,
  },
  nestedItem: {
    marginBottom: 12,
  },
});
