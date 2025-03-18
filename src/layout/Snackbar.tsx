import React, { useEffect, useState } from 'react';

interface SnackbarProps {
    message: string;
    onClose: () => void;
    type: 'success' | 'error';
}

const Snackbar: React.FC<SnackbarProps> = ({ message, onClose, type }) => {
    const [visible, setVisible] = useState(true);
    const backgroundColor = type === 'success' ? '#4caf50' : '#f44336';
    const borderColor = type === 'success' ? '#388e3c' : '#d32f2f';

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);
    useEffect(() => {
        if (!visible) {
            onClose();
        }
    }, [visible, onClose]);

    if (!visible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor,
                border: `1px solid ${borderColor}`,
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                opacity: 1,
                transition: 'opacity 0.5s ease',
                animation: 'dropIn 0.5s ease-out',
            }}
        >
            <span style={{ flex: 1 }}>{message}</span>
            <button
                onClick={() => setVisible(false)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    fontSize: '1.4rem',
                    cursor: 'pointer',
                    marginLeft: '16px',
                    transition: 'color 0.3s ease',
                }}
                aria-label="Close"
            >
                &times;
            </button>
            <style>
                {`
                    @keyframes dropIn {
                        from {
                            transform: translateX(-50%) translateY(-100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(-50%) translateY(0);
                            opacity: 1;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default Snackbar;
