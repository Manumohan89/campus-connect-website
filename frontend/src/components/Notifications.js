import React, { useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000'); // Ensure the correct backend server URL

function Notifications() {
  useEffect(() => {
    socket.on('notification', (data) => {
      alert(data.message);
    });

    return () => {
      socket.off('notification');
    };
  }, []);

  return null;
}

export default Notifications;
