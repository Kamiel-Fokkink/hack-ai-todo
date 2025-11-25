import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Formats a key into a readable title
 * Converts snake_case or camelCase to Title Case
 */
function formatTitle(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

/**
 * Renders nested content (arrays, strings, objects) without expansion
 */
function renderNestedContent(value) {
  if (Array.isArray(value)) {
    return (
      <View style={styles.listContainer}>
        {value.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listItemText}>{String(item)}</Text>
          </View>
        ))}
      </View>
    );
  } else if (typeof value === 'string') {
    return <Text style={styles.contentText}>{value}</Text>;
  } else if (typeof value === 'object' && value !== null) {
    // Render nested objects as key-value pairs (no expansion)
    return (
      <View style={styles.nestedObject}>
        {Object.keys(value).map((nestedKey) => (
          <View key={nestedKey} style={styles.nestedItem}>
            <Text style={styles.nestedKey}>{formatTitle(nestedKey)}:</Text>
            <Text style={styles.nestedValue}>{String(value[nestedKey])}</Text>
          </View>
        ))}
      </View>
    );
  } else {
    return <Text style={styles.contentText}>{String(value)}</Text>;
  }
}

/**
 * Single Expandable Block Component
 */
function ExpandableBlock({ title, children, isExpanded, onToggle }) {
  const rotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  return (
    <View style={styles.blockContainer}>
      <TouchableOpacity
        style={styles.blockHeader}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.blockTitle}>{title}</Text>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Text style={styles.expandIcon}>▼</Text>
        </Animated.View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.blockContent}>
          {children}
        </View>
      )}
    </View>
  );
}

/**
 * Main Component: Renders all JSON keys as expandable blocks
 */
export default function ExpandableJsonBlocks({ jsonData }) {
  const [expandedBlocks, setExpandedBlocks] = useState({});

  if (!jsonData || typeof jsonData !== 'object') {
    return null;
  }

  const toggleBlock = (key) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <View style={styles.container}>
      {Object.keys(jsonData)
        .filter(key => key.toLowerCase() !== 'metadata') // Hide metadata key
        .map((key) => {
          const value = jsonData[key];
          const title = formatTitle(key);
          const isExpanded = expandedBlocks[key] || false;

          return (
            <ExpandableBlock
              key={key}
              title={title}
              isExpanded={isExpanded}
              onToggle={() => toggleBlock(key)}
            >
              {renderNestedContent(value)}
            </ExpandableBlock>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  blockContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    flex: 1,
  },
  expandIcon: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
  },
  blockContent: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  contentText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  listContainer: {
    marginTop: 4,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 8,
    lineHeight: 24,
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    flex: 1,
  },
  nestedObject: {
    marginTop: 8,
  },
  nestedItem: {
    marginBottom: 12,
  },
  nestedKey: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  nestedValue: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});
