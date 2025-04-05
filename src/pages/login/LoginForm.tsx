import React, { useState, FormEvent, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
import { TextField, Button, Typography, Box } from '@mui/material';

const apiUrl = process.env.REACT_APP_API_URL;

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();
    const authContext = useContext(AuthContext) as AuthContextType;

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post<{ token: string; userName: string }>(`${apiUrl}/account/auth`, {
                email,
                password,
            });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userName', response.data.userName);
            authContext.setUser(response.data.userName);
            navigate('/dashboard');
        } catch (err) {
            setError('Wrong email or password');
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh',
                backgroundColor: '#ffffff',
            }}
        >
            {/* Left Column - Background Image with TalkSpace text */}
            <Box
                sx={{
                    width: '40%',
                    backgroundImage: 'url("/images/login-bg.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    display: { xs: 'none', md: 'block' },
                    position: 'relative',
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        position: 'absolute',
                        top: '40px',
                        left: '40px',
                        fontWeight: 'bold',
                        color: 'white',
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                    }}
                >
                    TalkSpace
                </Typography>
            </Box>

            {/* Right Column - Login Form */}
            <Box
                sx={{
                    width: { xs: '100%', md: '60%' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '40px',
                        backgroundColor: 'white',
                        borderRadius: '0',
                        boxShadow: 'none',
                    }}
                >
                    {/* Login Heading */}
                    <Typography
                        variant="h5"
                        sx={{
                            marginBottom: '32px',
                            fontWeight: '600',
                            color: '#000000',
                            textAlign: 'left',
                            fontSize: '24px',
                        }}
                    >
                        LogIn
                    </Typography>

                    {/* Login Form */}
                    <Box
                        component="form"
                        onSubmit={handleLogin}
                        sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                        }}
                    >
                        {/* Email Field */}
                        <TextField
                            label="Email"
                            type="email"
                            variant="outlined"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    '& fieldset': {
                                        borderColor: '#40e0d0',
                                        borderWidth: '2px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#48d1cc',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#48d1cc',
                                    },
                                },
                            }}
                        />

                        {/* Password Field */}
                        <TextField
                            label="Password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    '& fieldset': {
                                        borderColor: '#40e0d0',
                                        borderWidth: '2px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#48d1cc',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#48d1cc',
                                    },
                                },
                            }}
                        />

                        {/* Error Message */}
                        {error && (
                            <Typography color="error" sx={{ fontSize: '14px', textAlign: 'center' }}>
                                {error}
                            </Typography>
                        )}

                        {/* Login Button - Smaller and aligned left */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{
                                    height: '40px', // Smaller height
                                    width: '120px', // Smaller width
                                    fontWeight: '600',
                                    backgroundColor: '#40e0d0',
                                    color: '#ffffff',
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontSize: '16px',
                                    marginTop: '8px',
                                    '&:hover': {
                                        backgroundColor: '#48d1cc',
                                    },
                                }}
                            >
                                LogIn
                            </Button>
                        </Box>
                    </Box>

                    {/* Sign Up Link */}
                    <Typography
                        sx={{
                            marginTop: '24px',
                            fontSize: '14px',
                            color: '#000000',
                            textAlign: 'left',
                        }}
                    >
                        Don't have an account?{' '}
                        <span
                            onClick={authContext.redirectToSignUp}
                            style={{
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                color: '#40e0d0',
                            }}
                        >
                            SignUp
                        </span>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default LoginForm;