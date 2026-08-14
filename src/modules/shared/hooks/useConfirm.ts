import { useState, useCallback } from 'react';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  variant: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
}

const defaultState: ConfirmState = {
  isOpen: false,
  title: '',
  message: '',
  confirmLabel: 'Confirmar',
  variant: 'danger',
  onConfirm: () => {},
};

export const useConfirm = () => {
  const [state, setState] = useState<ConfirmState>(defaultState);

  const confirm = useCallback((options: {
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }) => {
    setState({
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel || 'Confirmar',
      variant: options.variant || 'danger',
      onConfirm: options.onConfirm,
    });
  }, []);

  const close = useCallback(() => {
    setState(defaultState);
  }, []);

  return { ...state, confirm, close };
};
