import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Folder, FileText, MessageSquare } from 'lucide-react';

const CommandPalette = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ classrooms: [], resources: [] });
    const { token } = useAuth();
    const navigate = useNavigate();

    // Toggle the menu when ⌘K is pressed
    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    useEffect(() => {
        if (query.length > 2 && token) {
            const fetchResults = async () => {
                try {
                    const [classRes, searchRes] = await Promise.all([
                        axios.get('http://localhost:5000/api/classroom', { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get(`http://localhost:5000/api/search?q=${query}`, { headers: { Authorization: `Bearer ${token}` } })
                    ]);
                    
                    const filteredClassrooms = classRes.data.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.subject.toLowerCase().includes(query.toLowerCase()));
                    setResults({ classrooms: filteredClassrooms, resources: searchRes.data.resources || [] });
                } catch (err) {
                    console.error(err);
                }
            };
            fetchResults();
        } else {
            setResults({ classrooms: [], resources: [] });
        }
    }, [query, token]);

    const handleSelect = (path) => {
        setOpen(false);
        navigate(path);
    };

    return (
        <Command.Dialog open={open} onOpenChange={setOpen} label="Global Command Menu">
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid var(--border)' }}>
                <Search size={20} color="var(--text-muted)" />
                <Command.Input 
                    value={query} 
                    onValueChange={setQuery} 
                    placeholder="Search classrooms, resources, or type a command..." 
                />
            </div>

            <Command.List>
                <Command.Empty>No results found.</Command.Empty>

                {results.classrooms.length > 0 && (
                    <Command.Group heading="Classrooms" style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {results.classrooms.map(c => (
                            <Command.Item key={c._id} onSelect={() => handleSelect(`/classroom/${c._id}`)}>
                                <Folder size={16} />
                                <span>{c.name} ({c.subject})</span>
                            </Command.Item>
                        ))}
                    </Command.Group>
                )}

                {results.resources.length > 0 && (
                    <Command.Group heading="Resources" style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '10px' }}>
                        {results.resources.map(r => (
                            <Command.Item key={r._id} onSelect={() => { setOpen(false); window.open(r.fileUrl, '_blank'); }}>
                                <FileText size={16} />
                                <span>{r.title}</span>
                            </Command.Item>
                        ))}
                    </Command.Group>
                )}

                <Command.Group heading="Commands" style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '10px' }}>
                    <Command.Item onSelect={() => handleSelect('/')}>
                        <Search size={16} />
                        <span>Go to Dashboard</span>
                    </Command.Item>
                </Command.Group>
            </Command.List>
        </Command.Dialog>
    );
};

export default CommandPalette;
