import { File, Directory, Paths } from 'expo-file-system';

class UserDataService {
  constructor() {
    this.userDataDir = new Directory(Paths.document, 'user_data');
    this.userDataFile = new File(this.userDataDir, 'user_data.json');
  }

  /**
   * Ensures the user_data directory exists
   */
  ensureDirectoryExists() {
    try {
      if (!this.userDataDir.exists) {
        this.userDataDir.create();
      }
    } catch (error) {
      console.error('Error creating directory:', error);
    }
  }

  /**
   * Retrieves user data from the JSON file
   * @returns {Promise<Object>} User data object with name and surname
   */
  async getUserData() {
    try {
      this.ensureDirectoryExists();
      
      if (!this.userDataFile.exists) {
        // Return default data if file doesn't exist
        return { name: '', surname: '', languages: [] };
      }
      
      const content = await this.userDataFile.text();
      const data = JSON.parse(content);
      
      // Ensure languages array exists for backward compatibility
      if (!data.languages) {
        data.languages = [];
      }
      
      return data;
    } catch (error) {
      console.error('Error reading user data:', error);
      return { name: '', surname: '', languages: [] };
    }
  }

  /**
   * Saves user data to the JSON file
   * @param {Object} data - User data object with name and surname
   * @returns {Promise<boolean>} Success status
   */
  async saveUserData(data) {
    try {
      this.ensureDirectoryExists();
      
      // Create file if it doesn't exist
      if (!this.userDataFile.exists) {
        this.userDataFile.create();
      }
      
      const jsonContent = JSON.stringify(data, null, 2);
      await this.userDataFile.write(jsonContent);
      
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  }
}

// Export a singleton instance
export default new UserDataService();

