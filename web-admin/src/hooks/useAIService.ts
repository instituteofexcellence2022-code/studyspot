import { useState, useCallback } from 'react';
import { apiService } from '../services';

export interface AIServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  text?: string;
  generatedText?: string;
}

export const useAIService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = useCallback(async (imageData: string): Promise<AIServiceResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.post('/ai/process-image', { imageData });
      return { success: true, data: response as any };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to process image';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const generateText = useCallback(async (prompt: string): Promise<AIServiceResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.post('/ai/generate-text', { prompt });
      return { success: true, data: response as any };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to generate text';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const chat = useCallback(async (message: string, context?: any): Promise<AIServiceResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.post('/ai/chat', { message, context });
      return { success: true, data: response as any };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to process chat';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    processImage,
    generateText,
    chat,
    // Add missing properties for compatibility
    status: 'active',
    metrics: {},
    models: [],
    insights: {},
    serviceControl: {},
    refresh: () => {},
    refreshMetrics: () => {},
    createModel: () => {},
    updateModel: () => {},
    deleteModel: () => {},
    processNLP: () => {}
  };
};




