import { useState, useEffect, useCallback } from 'react';
import { StatisticsResponse } from '../types';
import { urlService } from '../services/urlService';
import logger from '../utils/logger';

interface UseStatisticsReturn {
  data: StatisticsResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useStatistics = (): UseStatisticsReturn => {
  const [data, setData] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      logger.info('frontend', 'hook', 'Fetching statistics data');
      const stats = await urlService.getStatistics();
      
      setData(stats);
      logger.info('frontend', 'hook', `Statistics loaded: ${stats.total} URLs`);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load statistics';
      setError(errorMessage);
      logger.error('frontend', 'hook', `Statistics fetch failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const refresh = useCallback(async () => {
    await fetchStatistics();
  }, [fetchStatistics]);

  return {
    data,
    loading,
    error,
    refresh
  };
};
