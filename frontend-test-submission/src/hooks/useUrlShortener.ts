import { useState, useCallback } from 'react';
import { CreateUrlRequest, CreateUrlResponse } from '../types';
import { urlService } from '../services/urlService';
import logger from '../utils/logger';

interface UseUrlShortenerReturn {
  createUrls: (requests: CreateUrlRequest[]) => Promise<CreateUrlResponse[]>;
  loading: boolean;
  errors: string[];
  successes: CreateUrlResponse[];
  clearResults: () => void;
}

export const useUrlShortener = (): UseUrlShortenerReturn => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successes, setSuccesses] = useState<CreateUrlResponse[]>([]);

  const createUrls = useCallback(async (requests: CreateUrlRequest[]): Promise<CreateUrlResponse[]> => {
    setLoading(true);
    setErrors([]);
    setSuccesses([]);

    logger.info('frontend', 'hook', `Processing ${requests.length} URL creation requests`);

    const results: CreateUrlResponse[] = [];
    const errorMessages: string[] = [];

    // Process URLs concurrently (as required - up to 5 at once)
    const promises = requests.map(async (request, index) => {
      try {
        const result = await urlService.createShortUrl(request);
        results.push(result);
        logger.debug('frontend', 'hook', `URL ${index + 1} processed successfully`);
        return result;
      } catch (error: any) {
        const errorMsg = `URL ${index + 1}: ${error.message}`;
        errorMessages.push(errorMsg);
        logger.warn('frontend', 'hook', `URL ${index + 1} failed: ${error.message}`);
        throw error;
      }
    });

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      // Errors are already handled above
    }

    setSuccesses(results);
    setErrors(errorMessages);
    setLoading(false);

    logger.info('frontend', 'hook', `URL processing complete: ${results.length} success, ${errorMessages.length} errors`);

    return results;
  }, []);

  const clearResults = useCallback(() => {
    setErrors([]);
    setSuccesses([]);
    logger.debug('frontend', 'hook', 'Results cleared');
  }, []);

  return {
    createUrls,
    loading,
    errors,
    successes,
    clearResults
  };
};
