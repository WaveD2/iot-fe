import { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { IoClose } from 'react-icons/io5';
import { BiSend } from 'react-icons/bi';
import MessageBubble from './MessageBubble';
import LoadingSpinner from './Loading';
interface Message {
  _id: string;
  sender: string;
  content: string;
  createdAt: string;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { ref: loadMoreRef, inView } = useInView();

  const token = localStorage.getItem('accessToken')
    ? JSON.parse(localStorage.getItem('accessToken') || '')
    : '';

  useEffect(() => {
    if (isOpen && token) {
      loadMessages(1);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (inView && hasMore && !isLoading && token) {
      loadMessages(page + 1);
    }
  }, [inView]);

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const loadMessages = async (pageNum: number) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://smashing-valid-jawfish.ngrok-free.app/api/ai/message?page=${pageNum}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': '69420',
          },
        }
      );
      const data = await response.json();
      
      setMessages((prev) => [...prev, ...data]);
      setPage(pageNum);
      setHasMore(pageNum < data.pages);
    } catch (error) {
      console.error('Lỗi khi tải tin nhắn:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !token) return;

    const newMessage: Message = {
      _id: Date.now().toString(),
      sender: 'user',
      content: input,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [newMessage, ...prev]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://smashing-valid-jawfish.ngrok-free.app/api/ai/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': '69420',
          },
          body: JSON.stringify({ message: input }),
        }
      );
      const data = await response.json();
      
      if (data.response) {
        const botMessage: Message = {
          _id: data.response._id,
          sender: 'bot',
          content: data.response.content,
          createdAt: data.response.createdAt,
        };
        setMessages((prev) => [botMessage, ...prev]);
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      setMessages((prev) => [
        {
          _id: Date.now().toString(),
          sender: 'bot',
          content: 'Đã xảy ra lỗi. Vui lòng thử lại.',
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Nút mở chatbot */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gray-200 text-white rounded-full cursor-pointer p-3 shadow-lg hover:bg-gray-100 transition transform hover:scale-105"
        >
          <img src="https://www.svgrepo.com/show/389050/bot.svg" alt="Chat" className="w-8 h-8 text-white" />
        </button>
      )}

      {/* Cửa sổ chat */}
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 h-[500px] rounded-lg shadow-2xl flex flex-col animate-slide-up">
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h2 className="text-lg font-semibold">Trợ Lý Sức Khỏe</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition"
            >
              <IoClose size={24} />
            </button>
          </div>
          <div
            ref={chatContainerRef}
            className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col-reverse"
          >
            {token ? (
              <>
                {messages.map((msg, index) => (
                  <MessageBubble key={index} message={msg} />
                ))}
                {isLoading && messages.length > 0 && (
                  <div className="text-center py-2 animate-pulse">
                    <LoadingSpinner />
                  </div>
                )}
                {messages.length === 0 && !isLoading && (
                  <p className="text-center text-gray-500">Hỏi tôi về sức khỏe nhé!</p>
                )}
                {hasMore && (
                  <div ref={loadMoreRef} className="text-center py-2">
                    {isLoading && <LoadingSpinner />}
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-red-500 p-4">
                Vui lòng đăng nhập để sử dụng chatbot.
              </p>
            )}
          </div>
          {token && (
            <div className="p-3 bg-white border-t flex items-center">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
                  placeholder="Hỏi về sức khỏe..."
                  className="w-full p-2 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <BiSend
                    size={20}
                    className={`text-blue-600 ${input.trim() && !isLoading ? 'opacity-100' : 'opacity-50'}`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;