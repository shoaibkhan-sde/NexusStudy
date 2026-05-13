import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, File, MessageSquare, X } from 'lucide-react';

const SearchBar = ({ classroomId }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim()) {
                handleSearch();
            } else {
                setResults(null);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/search?q=${query}&classroomId=${classroomId || ''}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResults(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
            <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                    type="text" 
                    placeholder="Search resources, messages..." 
                    style={{ width: '100%', paddingLeft: '45px', borderRadius: '25px', background: 'var(--surface)' }}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                    <X 
                        size={18} 
                        style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer' }} 
                        onClick={() => setQuery('')}
                    />
                )}
            </div>

            {results && (
                <div className="glass-card animate-fade-in" style={{ 
                    position: 'absolute', 
                    top: '120%', 
                    left: 0, 
                    right: 0, 
                    maxHeight: '400px', 
                    overflowY: 'auto', 
                    zIndex: 100,
                    padding: '10px'
                }}>
                    {results.resources.length > 0 && (
                        <div style={{ marginBottom: '15px' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '10px', paddingLeft: '10px' }}>RESOURCES</p>
                            {results.resources.map(res => (
                                <div key={res._id} style={{ padding: '10px', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }} className="search-item-hover">
                                    <File size={16} color="var(--text-muted)" />
                                    <div>
                                        <p style={{ fontSize: '0.9rem' }}>{res.title}</p>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{res.type.toUpperCase()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {results.messages.length > 0 && (
                        <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 'bold', marginBottom: '10px', paddingLeft: '10px' }}>MESSAGES</p>
                            {results.messages.map(msg => (
                                <div key={msg._id} style={{ padding: '10px', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }} className="search-item-hover">
                                    <MessageSquare size={16} color="var(--text-muted)" />
                                    <div>
                                        <p style={{ fontSize: '0.9rem' }}>{msg.content}</p>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>from {msg.sender?.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {results.resources.length === 0 && results.messages.length === 0 && (
                        <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No results found</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
