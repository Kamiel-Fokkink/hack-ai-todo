const API_BASE_URL = 'http://20.224.45.128:80';

class TaskService {
  async submitCompletedTask(task) {
    try {
      console.log('Submitting completed task', { name: 'Koen', task });
      const response = await fetch(`${API_BASE_URL}/task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Koen',
          task,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      console.log('Task submission response', data);
      return data;
    } catch (error) {
      console.error('Error submitting task:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new TaskService();

