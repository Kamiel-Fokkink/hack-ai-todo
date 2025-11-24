// API Service for help-related endpoints
// TODO: Update API_BASE_URL when backend is ready
const API_BASE_URL = ''; // e.g., 'https://api.example.com'

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
      const endpoint = `${API_BASE_URL}/help`; // Placeholder endpoint
      
      const requestBody = {
        lang: lang,
        level: level
      };

      console.log('Requesting help with:', requestBody);
      console.log('Endpoint:', endpoint || '(not configured)');

      // Uncomment when backend is ready:
      /*
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
      return { success: true, data };
      */

      // Temporary mock response for development
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            employer: "Example Company",
            upload_date: new Date().toISOString(),
            filename: "help_instructions.txt",
            sender: "Support Team",
            recipient: "User",
            location: "Mobile App",
            daily_tasks: [
              "Review your language learning progress",
              "Practice speaking with native speakers",
              "Complete vocabulary exercises"
            ],
            weekly_tasks: [
              "Take a practice test to assess your level",
              "Watch a movie or TV show in your target language",
              "Read an article or book chapter"
            ],
            important_notes: [
              "Consistency is key to language learning success",
              "Don't be afraid to make mistakes - they're part of the learning process"
            ],
            contact_information: `Contact support at support@example.com for any questions about ${lang} (${level})`,
            purpose: `Helping you improve your ${lang} skills at ${level} level`
          });
        }, 500); // Simulate network delay
      });

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
