import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { File, Link as LinkIcon, Upload, Plus, ChevronLeft, Tag, FileText, Globe, MessageSquare, Search } from 'lucide-react';
import ChatSidebar from '../../components/ChatSidebar';
import SearchBar from '../../components/SearchBar';

const ResourceCard = ({ res, isPinned }) => (
    <div className="glass-card animate-fade-in" style={{ padding: '20px', border: isPinned ? '1px solid var(--primary)' : '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <div style={{ padding: '10px', background: 'var(--surface)', borderRadius: '10px', color: 'var(--primary)' }}>
                {res.type === 'pdf' ? <FileText size={24} /> : res.type === 'link' ? <Globe size={24} /> : <File size={24} />}
            </div>
            <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '5px' }}>{res.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Uploaded by {res.uploadedBy?.name}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '15px' }}>
                    {res.tags.map(tag => (
                        <span key={tag} style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(139, 92, 246, 0.2)', color: 'var(--primary)', borderRadius: '10px' }}>#{tag}</span>
                    ))}
                </div>
                <a href={res.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem', color: 'var(--secondary)', textDecoration: 'none', fontWeight: '600' }}>
                    View Resource
                </a>
            </div>
        </div>
    </div>
);

const ClassroomView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [classroom, setClassroom] = useState(null);
    const [resources, setResources] = useState([]);
    const [showUpload, setShowUpload] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [selectedTag, setSelectedTag] = useState('All');
    const [allTags, setAllTags] = useState([]);
    const [activeTab, setActiveTab] = useState('resources'); // resources or exams
    const [exams, setExams] = useState([]);
    const [showExamModal, setShowExamModal] = useState(false);
    const [examData, setExamData] = useState({ title: '', date: new Date(), description: '' });
    const [uploadData, setUploadData] = useState({ title: '', type: 'pdf', file: null, fileUrl: '', tags: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [classRes, resRes, examRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/classroom/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`http://localhost:5000/api/resource/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`http://localhost:5000/api/exam/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setClassroom(classRes.data);
            setResources(resRes.data);
            setExams(examRes.data);
            
            // Extract unique tags
            const tags = new Set(['All']);
            resRes.data.forEach(r => r.tags.forEach(t => tags.add(t)));
            setAllTags(Array.from(tags));
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('classroomId', id);
            formData.append('title', uploadData.title);
            formData.append('type', uploadData.type);
            formData.append('tags', uploadData.tags);
            if (uploadData.file) formData.append('file', uploadData.file);
            else formData.append('fileUrl', uploadData.fileUrl);

            await axios.post('http://localhost:5000/api/resource/upload', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setShowUpload(false);
            fetchData();
        } catch (err) {
            alert('Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const handleExamSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/exam', { ...examData, classroomId: id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowExamModal(false);
            fetchData();
        } catch (err) {
            alert('Failed to add exam');
        }
    };

    if (!classroom) return <div style={{ padding: '40px' }}>Loading...</div>;

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <button onClick={() => navigate('/')} style={{ background: 'transparent', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}>
                <ChevronLeft size={18} /> Back to Dashboard
            </button>

            <div className="glass-card" style={{ padding: '40px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem' }}>{classroom.name}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{classroom.subject} • {classroom.batch}</p>
                    <div style={{ marginTop: '15px', padding: '8px 15px', background: 'var(--surface)', borderRadius: '20px', display: 'inline-block', fontSize: '0.8rem' }}>
                        Invite Code: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{classroom.inviteCode}</span>
                    </div>
                </div>
                <div style={{ flex: 1, marginLeft: '40px', maxWidth: '400px' }}>
                    <SearchBar classroomId={id} />
                </div>
                <button className="primary" onClick={() => activeTab === 'resources' ? setShowUpload(true) : setShowExamModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {activeTab === 'resources' ? <><Upload size={18} /> Upload Resource</> : <><Plus size={18} /> Add Exam</>}
                </button>
            </div>

            <div style={{ display: 'flex', gap: '30px', marginBottom: '30px', borderBottom: '1px solid var(--border)' }}>
                <button 
                    onClick={() => setActiveTab('resources')}
                    style={{ background: 'transparent', padding: '10px 0', borderBottom: activeTab === 'resources' ? '2px solid var(--primary)' : 'none', borderRadius: 0, color: activeTab === 'resources' ? 'var(--primary)' : 'var(--text-muted)' }}
                >
                    Resources
                </button>
                <button 
                    onClick={() => setActiveTab('exams')}
                    style={{ background: 'transparent', padding: '10px 0', borderBottom: activeTab === 'exams' ? '2px solid var(--primary)' : 'none', borderRadius: 0, color: activeTab === 'exams' ? 'var(--primary)' : 'var(--text-muted)' }}
                >
                    Exam Calendar
                </button>
            </div>

            {activeTab === 'resources' ? (
                <>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '10px' }}>
                {allTags.map(tag => (
                    <button 
                        key={tag} 
                        onClick={() => setSelectedTag(tag)}
                        style={{ 
                            background: selectedTag === tag ? 'var(--primary)' : 'var(--surface)',
                            color: 'white',
                            fontSize: '0.8rem',
                            padding: '6px 15px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tag === 'All' ? tag : `#${tag}`}
                    </button>
                ))}
            </div>

            <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Resources {selectedTag !== 'All' && <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>- filtering by #{selectedTag}</span>}
            </h2>
            
            {/* Pinned Section */}
            {selectedTag === 'All' && resources.some(r => r.isPinned) && (
                <div style={{ marginBottom: '40px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '15px' }}>PINNED BY FACULTY</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {resources.filter(r => r.isPinned).map(res => (
                            <ResourceCard key={res._id} res={res} isPinned />
                        ))}
                    </div>
                </div>
            )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {resources.filter(r => (selectedTag === 'All' || r.tags.includes(selectedTag)) && !r.isPinned).length === 0 && <p style={{ color: 'var(--text-muted)' }}>No resources found.</p>}
                        {resources.filter(r => (selectedTag === 'All' || r.tags.includes(selectedTag)) && !r.isPinned).map(res => (
                            <ResourceCard key={res._id} res={res} />
                        ))}
                    </div>
                </>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                    <div className="glass-card" style={{ padding: '20px' }}>
                        <Calendar 
                            tileContent={({ date }) => {
                                const examOnDate = exams.find(e => new Date(e.date).toDateString() === date.toDateString());
                                return examOnDate ? <div style={{ height: '5px', width: '5px', background: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }}></div> : null;
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3>Upcoming Exams</h3>
                        {exams.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No exams scheduled.</p>}
                        {exams.sort((a,b) => new Date(a.date) - new Date(b.date)).map(exam => (
                            <div key={exam._id} className="glass-card animate-fade-in" style={{ padding: '20px' }}>
                                <h4 style={{ color: 'var(--primary)' }}>{exam.title}</h4>
                                <p style={{ fontSize: '0.9rem', margin: '5px 0' }}>{new Date(exam.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{exam.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modals & Sidebar */}
            <ChatSidebar 
                classroomId={id} 
                isOpen={showChat} 
                onClose={() => setShowChat(false)} 
            />

            {!showChat && (
                <button 
                    onClick={() => setShowChat(true)}
                    style={{ 
                        position: 'fixed', 
                        right: '40px', 
                        bottom: '40px', 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        zIndex: 40
                    }} 
                    className="primary"
                >
                    <MessageSquare size={24} />
                </button>
            )}

            {showUpload && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                    <div className="glass-card" style={{ padding: '40px', width: '450px' }}>
                        <h2>Upload Resource</h2>
                        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                            <input placeholder="Resource Title" onChange={e => setUploadData({...uploadData, title: e.target.value})} required />
                            <select 
                                value={uploadData.type} 
                                onChange={e => setUploadData({...uploadData, type: e.target.value})}
                                style={{ background: 'var(--surface)', color: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                            >
                                <option value="pdf">PDF Document</option>
                                <option value="link">External Link</option>
                                <option value="note">Note</option>
                            </select>
                            
                            {uploadData.type === 'link' ? (
                                <input placeholder="https://..." onChange={e => setUploadData({...uploadData, fileUrl: e.target.value})} required />
                            ) : (
                                <input type="file" onChange={e => setUploadData({...uploadData, file: e.target.files[0]})} required />
                            )}
                            
                            <input placeholder="Tags (comma separated)" onChange={e => setUploadData({...uploadData, tags: e.target.value})} />
                            
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" className="primary" style={{ flex: 1 }} disabled={loading}>
                                    {loading ? 'Uploading...' : 'Upload'}
                                </button>
                                <button type="button" onClick={() => setShowUpload(false)} style={{ flex: 1, background: 'var(--surface)' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showExamModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                    <div className="glass-card" style={{ padding: '40px', width: '450px' }}>
                        <h2>Schedule Exam</h2>
                        <form onSubmit={handleExamSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                            <input placeholder="Exam Title" onChange={e => setExamData({...examData, title: e.target.value})} required />
                            <input type="date" onChange={e => setExamData({...examData, date: e.target.value})} required style={{ background: 'var(--surface)', color: 'white', padding: '12px' }} />
                            <textarea placeholder="Description" onChange={e => setExamData({...examData, description: e.target.value})} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'white' }} />
                            
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" className="primary" style={{ flex: 1 }}>Schedule</button>
                                <button type="button" onClick={() => setShowExamModal(false)} style={{ flex: 1, background: 'var(--surface)' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassroomView;
