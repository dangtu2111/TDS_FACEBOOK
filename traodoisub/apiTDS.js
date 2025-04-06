import axios from 'axios';

class ApiService {
  constructor(baseURL) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 5000, // 5 seconds
    });
  }

  // GET method
  async get(url, config) {
    try {
      const response = await this.axiosInstance.get(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // POST method
  async post(url, data, config) {
    try {
      const response = await this.axiosInstance.post(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // PUT method
  async put(url, data, config) {
    try {
      const response = await this.axiosInstance.put(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // DELETE method
  async delete(url, config) {
    try {
      const response = await this.axiosInstance.delete(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Error handling method
  handleError(error) {
    if (error.response) {
      console.error(`API Error: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.request) {
      console.error('API Error: No response received from the server');
    } else {
      console.error(`API Error: ${error.message}`);
    }
  }
}

export default ApiService;
