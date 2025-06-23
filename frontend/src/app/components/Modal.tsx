'use client';

import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
import { ArrowLeft } from 'lucide-react';

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto transition-all duration-300 ease-in-out">
        
        {/* Back Arrow Button */}
        <button
          onClick={onClose}
          aria-label="Go back"
          className="absolute top-4 left-4 text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
  
        {/* Content area with extra top padding to prevent overlap */}
        <div className="pt-8">
          {children}
        </div>
      </div>
    </div>
  );
  
}
