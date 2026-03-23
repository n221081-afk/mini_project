import { useEffect } from 'react';

/**
 * Premium Modal Component
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - function to close the modal
 * @param {string} title - Modal heading
 * @param {React.ReactNode} children - Modal content
 */
export default function Modal({ isOpen, onClose, title, children }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-dark/20 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-primary-900/10 border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-xl font-bold text-dark tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-dark transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
}
