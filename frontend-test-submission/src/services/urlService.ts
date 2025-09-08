import axios from 'axios';
import { CreateUrlRequest, CreateUrlResponse, StatisticsResponse } from '../types';
import logger from '../utils/logger';

const API_BASE_URL = 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    logger.debug('frontend', 'api', `Making request to ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.error('frontend', 'api', `Request error: ${error.message}`);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    logger.debug('frontend', 'api', `Response received: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message;
    logger.error('frontend', 'api', `API error: ${message}`);
    return Promise.reject(error);
  }
);

export const urlService = {
  async createShortUrl(data: CreateUrlRequest): Promise<CreateUrlResponse> {
    try {
      logger.info('frontend', 'api', `Creating short URL for: ${data.url}`);
      const response = await apiClient.post('/shorturls', data);
      logger.info('frontend', 'api', `Short URL created successfully: ${response.data.shortLink}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create short URL';
      logger.error('frontend', 'api', `Create URL failed: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  },

  async getStatistics(): Promise<StatisticsResponse> {
    try {
      logger.info('frontend', 'api', 'Fetching URL statistics');
      const response = await apiClient.get('/api/statistics');
      logger.info('frontend', 'api', `Statistics fetched: ${response.data.total} URLs`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch statistics';
      logger.error('frontend', 'api', `Statistics fetch failed: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  },

  async testConnection(): Promise<boolean> {
    try {
      await apiClient.get('/health');
      logger.info('frontend', 'api', 'Backend connection test successful');
      return true;
    } catch (error) {
      logger.error('frontend', 'api', 'Backend connection test failed');
      return false;
    }
  }
};
