import React, { useState } from 'react';
import './LiveChat.css';

const LiveChat = () => {
  const [openChat, setOpenChat] = useState(false);

  const handleChatToggle = () => {
    setOpenChat(!openChat);
  };

  return (
    <div className="live-chat-container">
      <button className="live-chat-button" onClick={handleChatToggle}>
        {openChat ? 'Close Chat' : 'Live Chat'}
      </button>
      {openChat && (
        <div className="live-chat-box">
          <h4>How can we help you today?</h4>
          <textarea placeholder="Type your message..."></textarea>
          <button className="send-button">Send</button>
        </div>
      )}
    </div>
  );
};

export default LiveChat;
