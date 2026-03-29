'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AlertState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface AlertContextValue {
  alert: AlertState | null;
  showAlert: (type: AlertState['type'], message: string) => void;
  clearAlert: () => void;
}

const AlertContext = createContext<AlertContextValue>({
  alert: null,
  showAlert: () => {},
  clearAlert: () => {},
});

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertState | null>(null);

  const showAlert = useCallback((type: AlertState['type'], message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  }, []);

  const clearAlert = useCallback(() => setAlert(null), []);

  return (
    <AlertContext.Provider value={{ alert, showAlert, clearAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  return useContext(AlertContext);
}
