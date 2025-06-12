import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const ChatBox = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Merhaba! Size bugün nasıl yardımcı olabilirim?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/chat', {
        message: input
      });

      const responseContent = response.data.response;
      const cleanResponse = responseContent.replace(/<think>.*?<\/think>/s, '').trim();

      const assistantMessage = {
        role: 'assistant',
        content: cleanResponse
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.'
      }]);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div 
        className="flex items-center p-3 bg-gradient-to-b from-orange-300 to-orange-500 text-white cursor-pointer rounded-t-2xl"
        onClick={onClose}
      >
        <div className="w-6 h-6 mr-2">
          <img
            src="src/assets/DepoStok.png"
            alt="ChatBot"
            className="w-full h-full rounded-full"
          />
        </div>
        <div>
          <h2 className="font-semibold text-sm">DepoStok Asistan</h2>
          <div className="flex items-center text-xs">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></div>
            Çevrimiçi
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] p-2.5 rounded-xl text-sm ${
                message.role === "user"
                  ? "bg-orange-400 text-white"
                  : "bg-orange-50 text-gray-800"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t bg-white">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="flex-1 p-2 text-sm border rounded-lg focus:outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-400 disabled:opacity-50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

ChatBox.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default ChatBox; 