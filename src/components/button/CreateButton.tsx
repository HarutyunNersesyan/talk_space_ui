import React, { useState } from 'react';
import Snackbar from '../../layout/Snackbar';

interface CreateButtonProps {
    url: string;
    data: { [key: string]: any };
    disabled: boolean;
}

const CreateButton: React.FC<CreateButtonProps> = ({ url, data, disabled }) => {
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

    const handleClick = async () => {
        setStatusMessage(null);
        setMessageType(null);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            setStatusMessage('Create Successfully');
            setMessageType('success');
        } catch (error) {
            setStatusMessage('Create Failed: ' + (error as Error).message);
            setMessageType('error');
        }
    };

    const handleClose = () => {
        setStatusMessage(null);
        setMessageType(null);
    };

    return (
        <div>
            <button
                onClick={handleClick}
                disabled={disabled}
                style={{
                    padding: '12px 16px',
                    fontSize: '1.0rem',
                    backgroundColor: disabled ? '#ccc' : '#1e40af',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s ease',
                }}
            >
                Create
            </button>
            {statusMessage && messageType && (
                <Snackbar
                    message={statusMessage}
                    onClose={handleClose}
                    type={messageType}
                />
            )}
        </div>
    );
};

export default CreateButton;
