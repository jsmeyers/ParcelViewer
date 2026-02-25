import { useEffect } from 'react'
import useStore from '../../store/useStore'

export default function Toast() {
  const { toasts, removeToast } = useStore()

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
  }[toast.type] || 'bg-gray-50 border-gray-200'

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
    warning: 'text-yellow-800',
  }[toast.type] || 'text-gray-800'

  return (
    <div
      className={`px-4 py-3 rounded-lg border shadow-lg flex items-center gap-3 animate-slide-in ${bgColor}`}
      role="alert"
    >
      <span className={`text-sm ${textColor}`}>{toast.message}</span>
      <button
        onClick={onClose}
        className="p-0.5 hover:opacity-70"
        aria-label="Dismiss"
      >
        <svg className={`w-4 h-4 ${textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}