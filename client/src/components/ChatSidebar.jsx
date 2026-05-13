import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Send, MessageSquare, X } from 'lucide-react';

const ChatSidebar = ({ classroomId, isOpen, onClose }) => {
    const { user, token } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [typingUser, setTypingUser] = useState('');
    const socketRef = useRef();
    const messagesEndRef = useRef();

    useEffect(() => {
        socketRef.current = io('http://localhost:5000');
        
        socketRef.current.emit('join-room', classroomId);

        socketRef.current.on('receive-message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        socketRef.current.on('user-typing', (data) => {
            if (data.isTyping) {
                setTypingUser(data.userName);
            } else {
                setTypingUser('');
            }
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [classroomId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const messageData = {
            _id: 'temp-' + Date.now(), // Temporary ID for optimistic UI
            classroomId,
            sender: user.id,
            senderName: user.name,
            content: input,
            timestamp: new Date(),
            status: 'sending' // Optimistic flag
        };

        // Optimistically update UI
        setMessages((prev) => [...prev, messageData]);
        setInput('');

        socketRef.current.emit('send-message', messageData);
        socketRef.current.emit('typing', { classroomId, userName: user.name, isTyping: false });
    };

    // Listen for the confirmed message from server
    useEffect(() => {
        const handleReceive = (message) => {
            setMessages((prev) => {
                // If it's a confirmation of our own message, update the status and ID
                const tempIndex = prev.findIndex(m => m.content === message.content && m.status === 'sending' && m.sender === message.sender);
                if (tempIndex !== -1) {
                    const newMessages = [...prev];
                    newMessages[tempIndex] = { ...message, status: 'sent' };
                    return newMessages;
                }
                return [...prev, message];
            });
        };

        if (socketRef.current) {
            socketRef.current.off('receive-message'); // prevent duplicate listeners
            socketRef.current.on('receive-message', handleReceive);
        }
    }, [messages]);

    const handleTyping = (e) => {
        setInput(e.target.value);
        if (e.target.value.length > 0) {
            socketRef.current.emit('typing', { classroomId, userName: user.name, isTyping: true });
        } else {
            socketRef.current.emit('typing', { classroomId, userName: user.name, isTyping: false });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="glass-card animate-fade-in chat-sidebar-container">
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MessageSquare size={20} color="var(--primary)" />
                    <h3 style={{ fontSize: '1.1rem' }}>Classroom Chat</h3>
                </div>
                <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {messages.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '20px' }}>No messages yet. Say hi!</p>}
                {messages.map((msg, index) => (
                    <div key={index} style={{ 
                        alignSelf: msg.sender === user.id ? 'flex-end' : 'flex-start',
                        maxWidth: '80%'
                    }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textAlign: msg.sender === user.id ? 'right' : 'left' }}>
                            {msg.senderName}
                        </p>
                        <div style={{ 
                            padding: '10px 15px', 
                            borderRadius: '12px', 
                            background: msg.sender === user.id ? 'var(--primary)' : 'var(--surface)',
                            color: 'white',
                            fontSize: '0.9rem',
                            opacity: msg.status === 'sending' ? 0.7 : 1,
                            transition: 'opacity 0.2s'
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {typingUser && (
                <div style={{ padding: '0 20px', fontSize: '0.8rem', color: 'var(--primary)', fontStyle: 'italic', marginBottom: '5px' }}>
                    {typingUser} is typing...
                </div>
            )}

            <form onSubmit={handleSendMessage} style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
                <input 
                    placeholder="Type a message..." 
                    value={input}
                    onChange={handleTyping}
                    style={{ flex: 1, padding: '10px' }}
                />
                <button type="submit" className="primary" style={{ padding: '10px' }}>
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default ChatSidebar;
