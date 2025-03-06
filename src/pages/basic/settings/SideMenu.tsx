
import React from 'react';

interface SideMenuProps {
    config: { label: string }[];
    activeIndex: number;
    onItemClick: (index: number) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ config, activeIndex, onItemClick }) => {
    return (
        <div
            style={{
                width: '250px',
                borderRight: '2px solid #e5e7eb',
                padding: '1rem',
                background: '#ffffff',
                position: 'fixed',
                top: '70px',
                height: 'calc(100% - 80px)',
                overflowY: 'auto',
                boxShadow: '2px 0 5px rgba(0, 0, 0, 0.05)',
                color: '#0c4a6e',
            }}
        >
            {config.map((item, index) => (
                <div key={index}>
                    <h4
                        onClick={() => onItemClick(index)}
                        style={{
                            cursor: 'pointer',
                            padding: '15px 20px',
                            margin: 0,
                            backgroundColor: activeIndex === index ? '#f3f4f6' : '#ffffff',
                            borderBottom: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            transition: 'background-color 0.3s ease',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                        }}
                    >
                        {item.label}
                    </h4>
                </div>
            ))}
        </div>
    );
};

export default SideMenu;