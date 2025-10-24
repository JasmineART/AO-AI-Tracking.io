import React, { useEffect, useState } from 'react';
import { useToast } from '../contexts/ToastContext';

const Toast = ({ id, message, type, duration }) => {
  const { removeToast } = useToast();
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(id);
    }, 300); // Match animation duration
  };

  // Auto-close animation before removal
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
      }, duration - 300);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
          icon: '✅',
          border: 'border-green-400',
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-rose-500',
          icon: '❌',
          border: 'border-red-400',
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          icon: '⚠️',
          border: 'border-yellow-400',
        };
      case 'info':
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
          icon: 'ℹ️',
          border: 'border-blue-400',
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`
        ${styles.bg} 
        ${styles.border}
        border-2
        text-white 
        px-6 py-4 
        rounded-xl 
        shadow-2xl 
        flex 
        items-center 
        gap-3 
        min-w-[320px] 
        max-w-md
        transform
        transition-all
        duration-300
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        hover:scale-105
        cursor-pointer
      `}
      onClick={handleClose}
    >
      <span className="text-2xl">{styles.icon}</span>
      <p className="flex-1 font-semibold text-sm leading-relaxed">{message}</p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className="text-white hover:text-gray-200 transition-colors text-xl font-bold ml-2"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <div className="pointer-events-auto flex flex-col gap-3">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
