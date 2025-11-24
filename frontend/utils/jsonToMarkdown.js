/**
 * Utility to convert JSON response to Markdown format
 * 
 * Rules:
 * - Each key becomes a title (## Header)
 * - String values become paragraphs
 * - Array values become bullet point lists
 */

/**
 * Converts a JSON object to Markdown string
 * @param {Object} jsonData - The JSON data to convert
 * @returns {string} Markdown formatted string
 */
export function jsonToMarkdown(jsonData) {
  if (!jsonData || typeof jsonData !== 'object') {
    return '';
  }

  let markdown = '';

  // Iterate through each key in the JSON
  Object.keys(jsonData).forEach((key) => {
    const value = jsonData[key];
    
    // Convert key to title case and create header
    const title = formatTitle(key);
    markdown += `## ${title}\n\n`;

    // Handle different value types
    if (Array.isArray(value)) {
      // Convert array to bullet points
      value.forEach((item) => {
        markdown += `- ${item}\n`;
      });
      markdown += '\n';
    } else if (typeof value === 'string') {
      // Add string as paragraph
      markdown += `${value}\n\n`;
    } else if (typeof value === 'object' && value !== null) {
      // Handle nested objects (recursive)
      markdown += jsonToMarkdown(value);
    } else {
      // Handle primitives (numbers, booleans, etc.)
      markdown += `${value}\n\n`;
    }
  });

  return markdown;
}

/**
 * Formats a key into a readable title
 * Converts snake_case or camelCase to Title Case
 * @param {string} key - The key to format
 * @returns {string} Formatted title
 */
function formatTitle(key) {
  return key
    // Split on underscores or capital letters
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    // Capitalize first letter of each word
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

/**
 * Example usage:
 * 
 * const jsonData = {
 *   "daily_tasks": ["Task 1", "Task 2"],
 *   "contact_information": "Call 123-456-7890",
 *   "purpose": "To help you"
 * };
 * 
 * const markdown = jsonToMarkdown(jsonData);
 * 
 * Output:
 * ## Daily Tasks
 * 
 * - Task 1
 * - Task 2
 * 
 * ## Contact Information
 * 
 * Call 123-456-7890
 * 
 * ## Purpose
 * 
 * To help you
 */
