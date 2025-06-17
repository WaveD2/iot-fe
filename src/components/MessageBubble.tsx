interface Message {
    _id: string;
    sender: string;
    content: string;
    createdAt: string;
  }
  
  interface MessageBubbleProps {
    message: Message;
  }
  
  const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.sender === 'user';
    const time = new Date(message.createdAt).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className={`chat-bubble ${isUser ? 'user' : 'bot'}`}>
          <p>{message.content}</p>
          <span className="text-xs text-gray-500 mt-1 block">{time}</span>
        </div>
      </div>
    );
  };
  
  export default MessageBubble;