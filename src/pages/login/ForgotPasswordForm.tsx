import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FormField from './FormField';
import ErrorMessage from './ErrorMessage';
import { Button, Container, Typography, Paper, Box, Grid } from '@mui/material';

const apiUrl = process.env.REACT_APP_API_URL;

// Updated colors: true blue tones
const blue = '#2196F3'; // Main blue color (Material UI blue)
const darkBlue = '#1976D2'; // Darker blue for hover states

const ForgotPasswordForm: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleForgotPassword = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.put(`${apiUrl}/api/public/user/forgotPassword`, { email });
            if (response.status === 200) {
                navigate('/login', { state: { message: 'A new password has been sent to your email.' } });
            }
        } catch (err: any) {
            if (err.response) {
                setError(
                    err.response.status === 500
                        ? 'No account found with this email address.'
                        : err.response.data || 'Failed to reset password. Please try again.'
                );
            } else if (err.request) {
                setError('No response from the server. Please check your connection and try again.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', fontFamily: 'Poppins' }}>
            {/* Left Side with Background Image only */}
            <Box
                sx={{
                    width: '55%',
                    px: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    position: 'relative',
                }}
            >
                {/* Background Image */}
                <Box
                    sx={{
                        width: '100%',
                        height: 'calc(100% - 120px)',
                        backgroundImage: 'url(/images/forgot.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '20px',
                        marginTop: '60px',
                    }}
                />
            </Box>

            {/* Right Form */}
            <Box
                sx={{
                    width: '60%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                }}
            >
                <Container maxWidth="sm">
                    <Paper elevation={0} sx={{ p: 4, backgroundColor: '#ffffff', fontFamily: 'Poppins' }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#000000', mb: 4 }}>
                            Forgot Password
                        </Typography>
                        <form onSubmit={handleForgotPassword}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormField
                                        name="email"
                                        label="Email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        sx={{
                                            borderRadius: '20px',
                                            fontFamily: 'Poppins',
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '20px',
                                                fontFamily: 'Poppins',
                                                '& fieldset': { borderColor: blue },
                                                '&:hover fieldset': { borderColor: blue },
                                                '&.Mui-focused fieldset': { borderColor: blue },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: blue,
                                                fontFamily: 'Poppins',
                                            },
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <ErrorMessage message={error} />
                                </Grid>

                                {/* Buttons placed side by side */}
                                <Grid item xs={6}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        disabled={isLoading}
                                        sx={{
                                            px: 4,
                                            py: 1,
                                            fontSize: '0.85rem',
                                            backgroundColor: blue,
                                            fontWeight: 'bold',
                                            borderRadius: 20,
                                            textTransform: 'none',
                                            fontFamily: 'Poppins',
                                            '&:hover': {
                                                backgroundColor: darkBlue,
                                            },
                                        }}
                                    >
                                        {isLoading ? 'Sending...' : 'Reset Password'}
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        fullWidth
                                        onClick={handleCancel}
                                        sx={{
                                            px: 4,
                                            py: 1,
                                            fontSize: '0.85rem',
                                            borderColor: blue,
                                            color: blue,
                                            fontWeight: 'bold',
                                            borderRadius: 20,
                                            textTransform: 'none',
                                            fontFamily: 'Poppins',
                                            '&:hover': {
                                                borderColor: darkBlue,
                                                color: darkBlue,
                                                backgroundColor: 'transparent',
                                            },
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
};

export default ForgotPasswordForm;