import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Snackbar, Alert, AlertTitle } from '@mui/material'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
  hideToast: (id: string) => void
  clearAllToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToastContext() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove toast after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        hideToast(id)
      }, toast.duration || 5000)
    }
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, hideToast, clearAllToasts }}>
      {children}
      {toasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open={true}
          autoHideDuration={toast.duration || 5000}
          onClose={() => hideToast(toast.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ 
            top: `${80 + index * 80}px !important`, // Stack multiple toasts
          }}
        >
          <Alert 
            onClose={() => hideToast(toast.id)} 
            severity={toast.type}
            sx={{ width: '100%' }}
          >
            <AlertTitle>{toast.title}</AlertTitle>
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  )
}