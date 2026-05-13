import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, UserPlus, LogOut, BookOpen, Users, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import SkeletonLoader from '../components/SkeletonLoader';

const Dashboard = () => {
    const [classrooms, setClassrooms] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [newClass, setNewClass] = useState({ name: '', subject: '', batch: '' });
    const [inviteCode, setInviteCode] = useState('');
    const { token, logout, user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const fetchClassrooms = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/classroom/my-classrooms', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClassrooms(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/classroom/create', newClass, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowCreate(false);
            fetchClassrooms();
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to create');
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:5000/api/classroom/join/${inviteCode}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowJoin(false);
            fetchClassrooms();
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to join');
        }
    };

    return (
        <div className="container">
            <div className="header-flex">
                <div>
                    <h1 style={{ fontSize: '2.5rem' }}>Nexus<span style={{ color: 'var(--primary)' }}>Study</span></h1>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.name || 'Explorer'}</p>
                </div>
                <div className="header-actions">
                    <div className="search-wrapper">
                        <SearchBar />
                    </div>
                    <button onClick={logout} style={{ background: 'transparent', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            <div className="grid-cards">
                <div 
                    className="glass-card" 
                    style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', cursor: 'pointer' }}
                    onClick={() => setShowCreate(true)}
                >
                    <Plus size={40} color="var(--primary)" />
                    <p style={{ marginTop: '10px', fontWeight: '600' }}>Create Classroom</p>
                </div>

                <div 
                    className="glass-card" 
                    style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', cursor: 'pointer' }}
                    onClick={() => setShowJoin(true)}
                >
                    <UserPlus size={40} color="var(--secondary)" />
                    <p style={{ marginTop: '10px', fontWeight: '600' }}>Join with Code</p>
                </div>

                {loading ? (
                    <>
                        <SkeletonLoader type="card" />
                        <SkeletonLoader type="card" />
                        <SkeletonLoader type="card" />
                    </>
                ) : classrooms.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <BookOpen size={60} style={{ margin: '0 auto 20px', opacity: 0.5 }} />
                        <h3 style={{ marginBottom: '10px', color: 'var(--text)' }}>No classrooms yet</h3>
                        <p>Create a new classroom or join an existing one to get started.</p>
                    </div>
                ) : (
                    classrooms.map(cls => (
                        <div 
                            key={cls._id} 
                            className="glass-card animate-fade-in" 
                            style={{ padding: '25px', cursor: 'pointer' }}
                            onClick={() => navigate(`/classroom/${cls._id}`)}
                        >
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{cls.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>{cls.subject} • {cls.batch}</p>
                            <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Users size={14} /> {cls.members.length} members</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modals */}
            {showCreate && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content">
                        <h2>Create New Classroom</h2>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                            <input placeholder="Classroom Name" onChange={e => setNewClass({...newClass, name: e.target.value})} required />
                            <input placeholder="Subject" onChange={e => setNewClass({...newClass, subject: e.target.value})} required />
                            <input placeholder="Batch (e.g. CS 2025)" onChange={e => setNewClass({...newClass, batch: e.target.value})} required />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" className="primary" style={{ flex: 1 }}>Create</button>
                                <button type="button" onClick={() => setShowCreate(false)} style={{ flex: 1, background: 'var(--surface)' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showJoin && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content">
                        <h2>Join Classroom</h2>
                        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                            <input placeholder="Enter Invite Code" onChange={e => setInviteCode(e.target.value.toUpperCase())} required />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" className="primary" style={{ flex: 1 }}>Join</button>
                                <button type="button" onClick={() => setShowJoin(false)} style={{ flex: 1, background: 'var(--surface)' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
