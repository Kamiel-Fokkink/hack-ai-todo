// API Service for help-related endpoints
// TODO: Update API_BASE_URL when backend is ready
const API_BASE_URL = 'http://20.224.45.128:80'; // e.g., 'https://api.example.com'

class HelpService {
  /**
   * Request help for a specific language and level
   * @param {string} lang - The language name
   * @param {string} level - The proficiency level (A1, A2, B1, B2, C1, C2)
   * @returns {Promise<Object>} Response from the API
   */
  async requestHelp(lang, level) {
    try {
      // TODO: Replace with actual endpoint when available
      const endpoint = `${API_BASE_URL}/simplify`; // Placeholder endpoint
      
      const requestBody = {
        language: lang,
        level: level
      };

      console.log('Requesting help with:', requestBody);
      console.log('Endpoint:', endpoint || '(not configured)');

      // Uncomment when backend is ready:
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response:', data);
      return data;

    } catch (error) {
      console.error('Error requesting help:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export a singleton instance
export default new HelpService();
