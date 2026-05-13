import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Loader2 } from 'lucide-react';

const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { setToken, setUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/signup', formData);
            setToken(res.data.token);
            setUser(res.data.user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.msg || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px' }}>
            <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                <h1 style={{ marginBottom: '10px', fontSize: '2rem', textAlign: 'center' }}>Nexus<span style={{ color: 'var(--primary)' }}>Study</span></h1>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '30px' }}>Create your account to get started</p>
                
                {error && <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            type="text" 
                            placeholder="Full Name" 
                            style={{ width: '100%', paddingLeft: '40px' }} 
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            style={{ width: '100%', paddingLeft: '40px' }} 
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            style={{ width: '100%', paddingLeft: '40px' }} 
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="primary" disabled={loading} style={{ height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                    </button>
                </form>

                <p style={{ marginTop: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
