import React, { useState } from 'react';
import Snackbar from '../../layout/Snackbar';

interface UpdateButtonProps {
    url: string;
    data: { [key: string]: any };
    disabled: boolean;
}

const UpdateButton: React.FC<UpdateButtonProps> = ({ url, data, disabled }) => {
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

    const handleClick = async () => {
        setStatusMessage(null);
        setMessageType(null);

        try {
            const response = await fetch(url, {
                method: 'PUT',
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
            setStatusMessage('Update Successfully');
            setMessageType('success');
        } catch (error) {
            setStatusMessage('Update Failed: ' + (error as Error).message);
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
                disabled={disabled} // добавлено свойство disabled
                style={{
                    padding: '12px 16px',
                    fontSize: '1.0rem',
                    backgroundColor: disabled ? '#ccc' : '#1e40af', // изменяем цвет фона при отключении
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s ease',
                }}
            >
                Update
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

export default UpdateButton;
