import React from 'react';
import { Text } from 'react-native';

/**
 * Emoji regex pattern that matches most emoji characters
 * This includes standard emojis, flags, skin tones, etc.
 */
const EMOJI_REGEX = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;

/**
 * Checks if a character is an emoji
 */
function isEmoji(char) {
  return EMOJI_REGEX.test(char);
}

/**
 * Splits text into segments of regular text and emojis
 * Returns array of {type: 'text'|'emoji', content: string}
 */
function parseTextWithEmojis(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const segments = [];
  let currentSegment = { type: 'text', content: '' };

  // Split by emoji boundaries
  const matches = [...text.matchAll(EMOJI_REGEX)];

  if (matches.length === 0) {
    // No emojis, return as is
    return [{ type: 'text', content: text }];
  }

  let lastIndex = 0;

  matches.forEach((match) => {
    const emojiChar = match[0];
    const emojiIndex = match.index;

    // Add text before emoji
    if (emojiIndex > lastIndex) {
      const textBefore = text.slice(lastIndex, emojiIndex);
      if (textBefore) {
        segments.push({ type: 'text', content: textBefore });
      }
    }

    // Add emoji
    segments.push({ type: 'emoji', content: emojiChar });

    lastIndex = emojiIndex + emojiChar.length;
  });

  // Add remaining text after last emoji
  if (lastIndex < text.length) {
    const textAfter = text.slice(lastIndex);
    if (textAfter) {
      segments.push({ type: 'text', content: textAfter });
    }
  }

  return segments;
}

/**
 * Renders text with emojis styled larger
 * @param {string} text - The text to render
 * @param {object} textStyle - Style for regular text
 * @param {object} emojiStyle - Additional style for emojis (fontSize will be larger)
 * @returns {JSX} Rendered text with styled emojis
 */
export function renderTextWithLargeEmojis(text, textStyle = {}, emojiStyle = {}) {
  const segments = parseTextWithEmojis(text);

  if (segments.length === 0) {
    return null;
  }

  // If only one segment and it's text, render normally
  if (segments.length === 1 && segments[0].type === 'text') {
    return <Text style={textStyle}>{segments[0].content}</Text>;
  }

  const baseFontSize = textStyle.fontSize || 16;
  const emojiFontSize = emojiStyle.fontSize || baseFontSize * 1.5; // 50% larger

  return (
    <Text style={textStyle}>
      {segments.map((segment, index) => {
        if (segment.type === 'emoji') {
          return (
            <Text
              key={index}
              style={[
                emojiStyle,
                { fontSize: emojiFontSize, lineHeight: baseFontSize * 1.5 }
              ]}
            >
              {segment.content}
            </Text>
          );
        } else {
          return <Text key={index}>{segment.content}</Text>;
        }
      })}
    </Text>
  );
}

/**
 * Simple wrapper for common use case
 */
export function EnhancedText({ children, style, emojiSize = 1.5 }) {
  if (typeof children !== 'string') {
    return <Text style={style}>{children}</Text>;
  }

  const baseFontSize = style?.fontSize || 16;

  return renderTextWithLargeEmojis(
    children,
    style,
    { fontSize: baseFontSize * emojiSize }
  );
}
