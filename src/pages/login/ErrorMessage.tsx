import React from 'react';
import { Alert } from '@mui/material';

interface ErrorMessageProps {
    message: string | string[]; // Accepts both string and array of messages
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    if (!message || (Array.isArray(message) && message.length === 0)) return null;

    return (
        <Alert severity="error">
            {Array.isArray(message) ? (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {message.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            ) : (
                message
            )}
        </Alert>
    );
};

export default ErrorMessage;
