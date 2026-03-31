import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Card, TextField, Button, Chip, Stack,
  IconButton, Avatar, Select, MenuItem, FormControl, InputLabel,
  Badge, CircularProgress, Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PeopleIcon from '@mui/icons-material/People';
import Header from './Header';
import Footer from './Footer';
import { io } from 'socket.io-client';

const SUBJECTS = ['DBMS', 'OS', 'CN', 'DSA', 'OOP Java', 'ML', 'Python', 'Algorithms', 'Digital Electronics', 'Compiler Design', 'Maths', 'General'];
const AVATAR_COLORS = ['#4F46E5','#7C3AED','#0EA5E9','#10B981','#F59E0B','#EF4444'];

const timeStr = d => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

function getUser() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return { username: 'Guest', userId: null };
    const p = JSON.parse(atob(token.split('.')[1]));
    return { userId: p.userId, username: localStorage.getItem('username') || 'Student' };
  } catch { return { username: 'Student', userId: null }; }
}

export default function LiveChat() {
  const [subject, setSubject] = useState('General');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [online, setOnline] = useState(0);
  const [typing, setTyping] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const user = useRef(getUser());

  const roomKey = `study:${subject}`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Connect Socket.io
    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      timeout: 10000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setError('');
      socket.emit('join_room', { room: roomKey, ...user.current });
    });

    socket.on('connect_error', () => {
      setConnected(false);
      setError('Could not connect to study room server. Real-time chat requires socket.io on the server.');
    });

    socket.on('disconnect', () => setConnected(false));
    socket.on('room_history', msgs => setMessages(msgs));
    socket.on('new_message', msg => setMessages(prev => [...prev.slice(-99), msg]));
    socket.on('online_count', count => setOnline(count));
    socket.on('user_typing', ({ username }) => {
      setTyping(`${username} is typing...`);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setTyping(''), 2000);
    });
    socket.on('user_stop_typing', () => setTyping(''));
    socket.on('user_joined', ({ username }) => {
      setMessages(prev => [...prev, { id: Date.now(), username: 'System', body: `${username} joined the room`, is_system: true, created_at: new Date().toISOString() }]);
    });

    return () => { socket.disconnect(); };
  }, [roomKey]);

  // Rejoin room when subject changes
  useEffect(() => {
    if (socketRef.current?.connected) {
      setMessages([]);
      socketRef.current.emit('join_room', { room: roomKey, ...user.current });
    }
  }, [subject]);

  const send = () => {
    const msg = input.trim();
    if (!msg || !socketRef.current?.connected) return;
    socketRef.current.emit('send_message', { room: roomKey, message: msg, ...user.current });
    socketRef.current.emit('stop_typing', { room: roomKey });
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    else {
      socketRef.current?.emit('typing', { room: roomKey, username: user.current.username });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Header />
      <Box sx={{ background: 'linear-gradient(135deg,#1E1B4B,#4F46E5)', py: 4, px: 2 }}>
        <Container>
          <Typography variant="h4" fontWeight={900} color="white" fontFamily="'Space Grotesk',sans-serif" mb={0.5}>
            📚 Study Rooms
          </Typography>
          <Typography color="rgba(255,255,255,0.75)">Real-time subject study rooms — chat with batchmates studying the same topic</Typography>
        </Container>
      </Box>

      <Container sx={{ py: 3, flex: 1 }} maxWidth="md">
        {error && <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        {/* Room selector */}
        <Card elevation={0} sx={{ border: '1.5px solid #E2E8F0', borderRadius: 3, p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Study Room</InputLabel>
              <Select value={subject} onChange={e => setSubject(e.target.value)} label="Study Room" sx={{ borderRadius: 2 }}>
                {SUBJECTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: connected ? '#10B981' : '#EF4444' }} />
              <Typography fontSize="0.78rem" color="text.secondary">{connected ? 'Connected' : 'Disconnected'}</Typography>
            </Box>
            <Chip icon={<PeopleIcon sx={{ fontSize: '14px !important' }} />} label={`${online} online`} size="small"
              sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 700 }} />
            <Typography fontSize="0.75rem" color="text.secondary" ml="auto">Room: #{subject.toLowerCase().replace(/\s+/g, '-')}</Typography>
          </Box>
        </Card>

        {/* Messages */}
        <Card elevation={0} sx={{ border: '1.5px solid #E2E8F0', borderRadius: 3, display: 'flex', flexDirection: 'column', height: 480 }}>
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {messages.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4, color: '#9CA3AF' }}>
                <Typography fontSize="2rem" mb={1}>💬</Typography>
                <Typography fontSize="0.875rem">Be the first to say something in the {subject} room!</Typography>
                <Typography fontSize="0.78rem" mt={0.5}>Students studying {subject} right now will see your message.</Typography>
              </Box>
            )}
            {messages.map((msg, i) => {
              if (msg.is_system) return (
                <Box key={msg.id || i} sx={{ textAlign: 'center', my: 0.75 }}>
                  <Typography fontSize="0.68rem" color="text.secondary">{msg.body}</Typography>
                </Box>
              );
              const isMe = msg.username === user.current.username;
              const colorIdx = msg.username?.charCodeAt(0) % AVATAR_COLORS.length || 0;
              return (
                <Box key={msg.id || i} sx={{ display: 'flex', gap: 1, mb: 1.5, flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                  {!isMe && (
                    <Avatar sx={{ width: 28, height: 28, bgcolor: AVATAR_COLORS[colorIdx], fontSize: '0.68rem', flexShrink: 0 }}>
                      {msg.username?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                  )}
                  <Box sx={{ maxWidth: '72%' }}>
                    {!isMe && <Typography fontSize="0.68rem" color="text.secondary" mb={0.3} ml={0.5}>{msg.username}</Typography>}
                    <Box sx={{
                      bgcolor: isMe ? '#4F46E5' : 'white', color: isMe ? 'white' : '#111827',
                      borderRadius: isMe ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                      px: 1.5, py: 1, border: isMe ? 'none' : '1px solid #E2E8F0', display: 'inline-block'
                    }}>
                      <Typography fontSize="0.82rem" lineHeight={1.5} sx={{ wordBreak: 'break-word' }}>{msg.body}</Typography>
                    </Box>
                    <Typography fontSize="0.6rem" color="text.secondary" mt={0.3} sx={{ textAlign: isMe ? 'right' : 'left' }} mx={0.5}>
                      {timeStr(msg.created_at)}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
            {typing && <Typography fontSize="0.72rem" color="text.secondary" mb={1}>{typing}</Typography>}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box sx={{ p: 1.5, borderTop: '1px solid #F1F5F9', display: 'flex', gap: 1 }}>
            <TextField fullWidth size="small" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown} disabled={!connected}
              placeholder={connected ? `Message #${subject.toLowerCase()} room...` : 'Connecting...'}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.875rem' } }} />
            <Button variant="contained" onClick={send} disabled={!input.trim() || !connected}
              sx={{ minWidth: 44, px: 1.5, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius: 2, boxShadow: 'none' }}>
              <SendIcon sx={{ fontSize: 18 }} />
            </Button>
          </Box>
        </Card>

        <Alert severity="info" sx={{ mt: 2, borderRadius: 2, fontSize: '0.78rem' }}>
          💡 <strong>Study tip:</strong> Join the room for your current subject. Ask doubts, share notes, or discuss exam strategies with batchmates in real time.
        </Alert>
      </Container>
      <Footer />
    </Box>
  );
}
