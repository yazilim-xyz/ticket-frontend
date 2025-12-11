import React, { useState, useRef, useEffect } from 'react';

interface TicketActionsMenuProps {
  ticketId: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDarkMode?: boolean;
  userRole?: 'user' | 'admin';
}

const TicketActionsMenu: React.FC<TicketActionsMenuProps> = ({
  ticketId,
  onView,
  onEdit,
  onDelete,
  isDarkMode = false,
  userRole
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-8 h-8 rounded flex items-center justify-center transition-colors
          ${isDarkMode 
            ? 'hover:bg-gray-700 text-gray-400' 
            : 'hover:bg-gray-100 text-gray-600'
          }
        `}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className={`
            absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 py-1
            ${isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
            }
          `}
        >
          {/* View Details - Both user and admin */}
          <button
            onClick={() => {
              onView();
              setIsOpen(false);
            }}
            className={`
              w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors
              ${isDarkMode 
                ? 'text-gray-200 hover:bg-gray-700' 
                : 'text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Details
          </button>
          
          {/* Update Status - Both user and admin */}
          <button
            onClick={() => {
              onEdit();
              setIsOpen(false);
            }}
            className={`
              w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors
              ${isDarkMode 
                ? 'text-gray-200 hover:bg-gray-700' 
                : 'text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Update Status
          </button>
          
          {/* Delete Ticket - Admin only */}
          {userRole === 'admin' && (
            <>
              <div className={`h-px my-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
              
              <button
                onClick={() => {
                  onDelete();
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors
                  text-red-600 hover:bg-red-50
                  ${isDarkMode && 'hover:bg-red-900/20'}
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Ticket
              </button>
            </>
          )} 
        </div>
      )}
    </div>
  );
};

export default TicketActionsMenu;