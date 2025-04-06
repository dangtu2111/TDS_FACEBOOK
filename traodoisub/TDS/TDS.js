import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import Logger from "../../utils/Logger.js";


class TDS {
  constructor(token, username, password) {
    this.token = token;
    this.username = username;
    this.password = password;
    // Initialize axiosInstance with default configuration
    this.axiosInstance = axios.create({
      baseURL: 'https://traodoisub.com/api/',
      timeout: 5000, // Timeout duration
      headers: {},
    });
  }

  getUsername() {
    return this.username;
  }

  /**
   * Get list of jobs from Traodoisub.
   * @param {string} type - Job type (e.g., "facebook_reaction")
   * @returns {Promise<any>} - Job data or error
   */
  async api_get_job_fb(type) {
    const url = `?fields=${type}&access_token=${this.token}`;

    try {
      console.log(`Sending request to API with URL: ${url}`);
      const response = await this.axiosInstance.get(url);

      if (response.data.error === 'Thao tác quá nhanh vui lòng chậm lại') {
        await new Promise(resolve => setTimeout(resolve, response.data.countdown * 1000));
        return this.api_get_job_fb(type); // Retry
      }
      return response.data;
    } catch (error) {
      console.error("Error calling API:", error.message);

      // Check for timeout error and retry if necessary
      if (error.code === 'ECONNABORTED') {
        console.warn("Request timed out. Retrying...");
        try {
          const retryResponse = await this.axiosInstance.get(url);
          console.log("Data returned after retry: ", retryResponse.data);
          return retryResponse.data;
        } catch (retryError) {
          console.error("Error during retry:", retryError.message);
          this.handleError(retryError);
          throw retryError;
        }
      }

      this.handleError(error);
      throw error;
    }
  }

  /**
   * Handle API errors
   * @param {any} error - The received error
   */
  handleError(error) {
    if (error.response) {
      console.error(`API Error: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.request) {
      console.error('API Error: No response received from the server');
    } else {
      console.error(`API Error: ${error.message}`);
    }
  }

  async api_get_money(type, idfb) {
    try {
      const response = await axios.get(`https://traodoisub.com/api/coin/?type=${type}&id=${idfb}&&access_token=${this.token}`);
      // console.log('GET MONEY: ', `https://traodoisub.com/api/coin/?type=${type}&id=${idfb}&&access_token=${this.token}`);
      if (response.data.error === "Thất bại! Bạn chưa like ID này!") {
        // Example usage of Logger
        Logger.success(`https://traodoisub.com/api/coin/?type=${type}&id=${idfb}&&access_token=${this.token}\n`);
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Internal Server Error');
    }
  }

  async api_config_account(idfb) {
    try {
      const response = await axios.get(`https://traodoisub.com/api/?fields=run&id=${idfb}&access_token=${this.token}`);
      // console.log(`https://traodoisub.com/api/?fields=run&id=${idfb}&access_token=${this.token}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Internal Server Error');
    }
  }
}



export default TDS;
