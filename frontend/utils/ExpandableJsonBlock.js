import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { renderTextWithLargeEmojis } from './emojiRenderer';
import TaskChecklistRenderer, {
  TaskChecklistArray,
  TaskChecklistNested,
} from './TaskChecklistRenderer';
import TaskService from '../services/TaskService';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function formatTitle(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

function getTotalTaskCount(value) {
  if (Array.isArray(value)) return value.length;
  if (typeof value === 'string') {
    return value
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0).length;
  }
  if (value && typeof value === 'object') return Object.keys(value).length;
  return 0;
}

function renderNestedContent(
  value,
  hasTasks = false,
  blockKey,
  checkedItems = {},
  onToggleCheckbox
) {
  const blockCheckedItems = checkedItems[blockKey] || {};

  const handleToggle = (itemKey, taskValue) => {
    if (onToggleCheckbox) onToggleCheckbox(blockKey, itemKey, taskValue);
  };

  if (Array.isArray(value)) {
    if (hasTasks) {
      return (
        <TaskChecklistArray
          items={value}
          style={styles.listItemText}
          checkedItems={blockCheckedItems}
          onToggle={handleToggle}
        />
      );
    }
    return (
      <View style={styles.listContainer}>
        {value.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            {renderTextWithLargeEmojis(String(item), styles.listItemText)}
          </View>
        ))}
      </View>
    );
  } else if (typeof value === 'string') {
    if (hasTasks) {
      return (
        <TaskChecklistRenderer
          text={value}
          style={styles.contentText}
          checkedItems={blockCheckedItems}
          onToggle={handleToggle}
        />
      );
    }
    return renderTextWithLargeEmojis(value, styles.contentText);
  } else if (typeof value === 'object' && value !== null) {
    if (hasTasks) {
      return (
        <TaskChecklistNested
          object={value}
          keyStyle={styles.nestedKey}
          valueStyle={styles.nestedValue}
          checkedItems={blockCheckedItems}
          onToggle={handleToggle}
        />
      );
    }
    return (
      <View style={styles.nestedObject}>
        {Object.keys(value).map((nestedKey) => (
          <View key={nestedKey} style={styles.nestedItem}>
            <Text style={styles.nestedKey}>{formatTitle(nestedKey)}:</Text>
            {renderTextWithLargeEmojis(
              String(value[nestedKey]),
              styles.nestedValue
            )}
          </View>
        ))}
      </View>
    );
  } else {
    if (hasTasks) {
      return (
        <TaskChecklistRenderer
          text={String(value)}
          style={styles.contentText}
          checkedItems={blockCheckedItems}
          onToggle={handleToggle}
        />
      );
    }
    return renderTextWithLargeEmojis(String(value), styles.contentText);
  }
}

function ExpandableBlock({
  title,
  children,
  isExpanded,
  onToggle,
  hasTasks,
  completed,
}) {
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
    LayoutAnimation.configureNext({
      duration: 200,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    onToggle();
  };

  const headerStyles = [
    styles.blockHeader,
    hasTasks && styles.blockHeaderWithTasks,
    completed && styles.blockHeaderCompleted,
  ];
  const titleStyles = [
    styles.blockTitle,
    hasTasks && styles.blockTitleWithTasks,
    completed && styles.blockTitleCompleted,
  ];
  const iconStyles = [
    styles.expandIcon,
    hasTasks && styles.expandIconWithTasks,
    completed && styles.expandIconCompleted,
  ];

  return (
    <View style={styles.blockContainer}>
      <TouchableOpacity
        style={headerStyles}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <Text style={titleStyles}>{title}</Text>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Text style={iconStyles}>▼</Text>
        </Animated.View>
      </TouchableOpacity>

      {isExpanded && <View style={styles.blockContent}>{children}</View>}
    </View>
  );
}

export default function ExpandableJsonBlocks({
  jsonData,
  taskClassification = {},
}) {
  const validKeys =
    jsonData && typeof jsonData === 'object'
      ? Object.keys(jsonData).filter(
          (key) => key.toLowerCase() !== 'metadata'
        )
      : [];

  const [expandedKey, setExpandedKey] = useState(
    validKeys.length > 0 ? validKeys[0] : null
  );

  const [checkedItems, setCheckedItems] = useState({});

  if (!jsonData || typeof jsonData !== 'object') return null;

  const toggleBlock = (key) => {
    setExpandedKey((prevKey) => (prevKey === key ? null : key));
  };

  const toggleCheckbox = (blockKey, itemKey, taskText) => {
    setCheckedItems((prev) => {
      const blockState = prev[blockKey] || {};
      const wasChecked = blockState[itemKey] || false;
      const updatedBlock = {
        ...blockState,
        [itemKey]: !wasChecked,
      };
      if (!wasChecked && taskText) {
        TaskService.submitCompletedTask(taskText);
      }
      return {
        ...prev,
        [blockKey]: updatedBlock,
      };
    });
  };

  return (
    <View style={styles.container}>
      {validKeys.map((key) => {
        const value = jsonData[key];
        const title = formatTitle(key);
        const isExpanded = expandedKey === key;
        const hasTasks = taskClassification[key] || false;

        let completed = false;
        if (hasTasks) {
          const totalTasks = getTotalTaskCount(value);
            const checkedCount = Object.values(checkedItems[key] || {}).filter(Boolean).length;
          completed =
            totalTasks > 0 && checkedCount === totalTasks && checkedCount !== 0;
        }

        return (
          <ExpandableBlock
            key={key}
            title={title}
            isExpanded={isExpanded}
            onToggle={() => toggleBlock(key)}
            hasTasks={hasTasks}
            completed={completed}
          >
            {renderNestedContent(
              value,
              hasTasks,
              key,
              checkedItems,
              toggleCheckbox
            )}
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
  blockHeaderWithTasks: {
    backgroundColor: '#FBF4DD', // softer yellow
  },
  blockHeaderCompleted: {
    backgroundColor: '#E9F7EC', // very light green
    borderColor: '#B7D5BC',
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#478FEB',
    flex: 1,
  },
  blockTitleWithTasks: {
    color: '#B99724',
  },
  blockTitleCompleted: {
    color: '#3A6F3A',
  },
  expandIcon: {
    fontSize: 14,
    color: '#478FEB',
    marginLeft: 8,
  },
  expandIconWithTasks: {
    color: '#B99724',
  },
  expandIconCompleted: {
    color: '#3A6F3A',
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
    color: '#478FEB',
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
