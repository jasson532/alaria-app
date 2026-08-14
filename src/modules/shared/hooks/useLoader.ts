import { useCallback } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { showLoader, hideLoader } from '../store/uiSlice';

const MIN_LOADER_TIME = 2000; // 2 segundos mínimo

export const useLoader = () => {
  const dispatch = useAppDispatch();

  const withLoader = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    dispatch(showLoader());
    const start = Date.now();
    try {
      const result = await fn();
      const elapsed = Date.now() - start;
      if (elapsed < MIN_LOADER_TIME) {
        await new Promise((resolve) => setTimeout(resolve, MIN_LOADER_TIME - elapsed));
      }
      return result;
    } finally {
      dispatch(hideLoader());
    }
  }, [dispatch]);

  return { withLoader, show: () => dispatch(showLoader()), hide: () => dispatch(hideLoader()) };
};
