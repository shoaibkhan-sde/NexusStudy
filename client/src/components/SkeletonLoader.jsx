import React from 'react';

const SkeletonLoader = ({ type }) => {
    if (type === 'card') {
        return (
            <div className="glass-card skeleton" style={{ padding: '20px', height: '140px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)' }}></div>
                <div className="skeleton" style={{ width: '60%', height: '20px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}></div>
                <div className="skeleton" style={{ width: '40%', height: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}></div>
            </div>
        );
    }

    if (type === 'header') {
        return (
            <div className="glass-card skeleton" style={{ padding: '40px', height: '150px', marginBottom: '40px' }}></div>
        );
    }

    return <div className="skeleton" style={{ width: '100%', height: '20px' }}></div>;
};

export default SkeletonLoader;
