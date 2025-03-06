import React from 'react';
import { Alert } from '@mui/material';

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
    message ? <Alert severity="error">{message}</Alert> : null
);

export default ErrorMessage;
