import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import FormField from './FormField';
import ErrorMessage from './ErrorMessage';
import { Button, Container, Typography, Paper, Box, CircularProgress } from '@mui/material';

const apiUrl = process.env.REACT_APP_API_URL;

const VerifyEmailForm: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [email] = useState<string>(location.state?.email || '');
    const [pin, setPin] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state

    const handleVerify = async () => {
        setError(''); // Clear previous errors
        setIsLoading(true); // Start loading

        try {
            const response = await axios.put(`${apiUrl}/api/public/user/verify`, { email, pin });

            // If verification is successful, redirect to login
            if (response.status === 200) {
                navigate('/login', { state: { message: 'Email verified successfully! Please log in.' } });
            }
        } catch (err: any) {
            console.error('Verification error:', err); // Log the error for debugging

            if (err.response) {
                // Backend responded with an error
                const errorMessage = err.response.data.message || 'Verification failed. Please try again.';
                setError(errorMessage); // Display only the message field
            } else if (err.request) {
                // No response from the server
                setError('No response from the server. Please check your connection and try again.');
            } else {
                // Something went wrong in setting up the request
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <Container maxWidth="sm">
                <Paper elevation={12} sx={{ padding: 4, textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom>
                        Verify Email
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Please enter the verification code sent to your email.
                    </Typography>

                    {/* Email Field (Disabled) */}
                    <FormField
                        name="email"
                        label="Email"
                        type="email"
                        value={email}
                        disabled
                    />

                    {/* Verification Code Field */}
                    <FormField
                        name="pin"
                        label="Verification Code"
                        type="text"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                    />

                    {/* Error Message */}
                    {error && <ErrorMessage message={error} />}

                    {/* Verify Button */}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleVerify}
                        disabled={isLoading} // Disable button while loading
                        fullWidth
                        sx={{ marginTop: 2 }}
                    >
                        {isLoading ? <CircularProgress size={24} /> : 'Verify'}
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
};

export default VerifyEmailForm;