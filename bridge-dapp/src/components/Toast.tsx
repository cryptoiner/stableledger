'use client'

import { useEffect, useState } from 'react'

export interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  onClose?: (id: string) => void
}

export default function Toast({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    
    // Auto-dismiss after duration
    const dismissTimer = setTimeout(() => {
      handleDismiss()
    }, duration)

    return () => {
      clearTimeout(timer)
      clearTimeout(dismissTimer)
    }
  }, [duration])

  const handleDismiss = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose?.(id)
    }, 300)
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case 'info':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const getToastClasses = () => {
    const baseClasses = 'glass rounded-2xl p-4 shadow-lg backdrop-blur-md border transition-all duration-300 max-w-sm w-full'
    const visibilityClasses = isVisible && !isLeaving 
      ? 'translate-x-0 opacity-100' 
      : isLeaving 
        ? 'translate-x-full opacity-0' 
        : 'translate-x-full opacity-0'
    
    const typeClasses = {
      success: 'border-success border-opacity-30 bg-success bg-opacity-10',
      error: 'border-error border-opacity-30 bg-error bg-opacity-10',
      warning: 'border-warning border-opacity-30 bg-warning bg-opacity-10',
      info: 'border-primary border-opacity-30 bg-primary bg-opacity-10'
    }

    return `${baseClasses} ${visibilityClasses} ${typeClasses[type]}`
  }

  const getIconClasses = () => {
    const baseClasses = 'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center'
    const typeClasses = {
      success: 'bg-success text-white',
      error: 'bg-error text-white',
      warning: 'bg-warning text-white',
      info: 'bg-primary text-white'
    }
    return `${baseClasses} ${typeClasses[type]}`
  }

  return (
    <div className={getToastClasses()}>
      <div className="flex items-start space-x-3">
        <div className={getIconClasses()}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">{title}</p>
          {message && (
            <p className="text-white text-sm opacity-80 mt-1">{message}</p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-white opacity-60 hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white hover:bg-opacity-10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Toast Container Component
interface ToastContainerProps {
  toasts: ToastProps[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  )
}

// Toast Hook for easy usage
interface UseToastReturn {
  toasts: ToastProps[]
  showToast: (toast: Omit<ToastProps, 'id'>) => string
  hideToast: (id: string) => void
  clearAllToasts: () => void
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const showToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    return id
  }

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearAllToasts = () => {
    setToasts([])
  }

  return {
    toasts,
    showToast,
    hideToast,
    clearAllToasts
  }
}