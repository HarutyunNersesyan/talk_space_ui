
import React from 'react';

interface SectionHeaderProps {
    label: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ label }) => {
    return (
        <div>
            <h2 style={{ color: '#0c4a6e', fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', fontWeight: 'bold' }}>
                {label}
            </h2>
            <hr style={{ border: '1px solid #e5e7eb', marginBottom: '2rem' }} />
        </div>
    );
};

export default SectionHeader;