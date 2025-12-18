import { useState, useEffect, useCallback } from 'react';
import { ImageMapping } from '@/types/jewellery';

const STORAGE_KEY = 'rk_gold_image_mappings';

export function useImageStorage() {
  const [imageMappings, setImageMappings] = useState<ImageMapping>({});

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setImageMappings(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading image mappings:', e);
    }
  }, []);

  // Save to localStorage whenever mappings change
  const saveToStorage = useCallback((mappings: ImageMapping) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
    } catch (e) {
      console.error('Error saving image mappings:', e);
    }
  }, []);

  const setImageForDesign = useCallback((designNo: string, imageBase64: string) => {
    setImageMappings(prev => {
      const updated = { ...prev, [designNo]: imageBase64 };
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const getImageForDesign = useCallback((designNo: string): string | undefined => {
    return imageMappings[designNo];
  }, [imageMappings]);

  const removeImageForDesign = useCallback((designNo: string) => {
    setImageMappings(prev => {
      const updated = { ...prev };
      delete updated[designNo];
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  return {
    imageMappings,
    setImageForDesign,
    getImageForDesign,
    removeImageForDesign,
  };
}
