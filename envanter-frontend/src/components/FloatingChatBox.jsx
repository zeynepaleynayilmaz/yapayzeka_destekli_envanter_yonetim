import { useState, useEffect, useRef } from 'react';
import ChatBox from './ChatBox';

const FloatingChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const chatboxRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatboxRef.current && !chatboxRef.current.contains(event.target)) {
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

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {isOpen ? (
        <div className="relative" ref={chatboxRef}>
          <div className="absolute bottom-0 right-0 w-[320px] h-[480px] bg-white rounded-2xl shadow-2xl overflow-hidden">
            <ChatBox onClose={handleClose} />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-orange-600 hover:bg-orange-500 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <span className="absolute -top-2 -right-2 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></span>
          </div>
        </button>
      )}
    </div>
  );
};

export default FloatingChatBox; 