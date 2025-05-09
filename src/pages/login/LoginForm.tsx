import React, { useState, FormEvent, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
    TextField,
    Button,
    Typography,
    Box,
    InputAdornment,
    IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const apiUrl = process.env.REACT_APP_API_URL;
const blue = '#1abc9c';

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${apiUrl}/account/auth`, {
                email,
                password,
            });

            if (response.status === 200) {
                const token = response.data.token;
                localStorage.setItem('token', token);

                // Decode token to get user info
                const [, payload] = token.split('.');
                const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
                const userName = decodedPayload.sub;
                const userRole = decodedPayload.roles && decodedPayload.roles.length > 0 ? decodedPayload.roles[0] : 'USER';

                if (authContext) {
                    authContext.setUser(userName, userRole);
                    // Redirect based on role
                    if (userRole === 'ADMIN') {
                        navigate('/admin');
                    } else {
                        navigate('/home');
                    }
                }
            }
        } catch (err: any) {
            if (err.response && err.response.status === 403) {
                setError(err.response.data);
            } else {
                setError('Wrong email or password');
            }
        }
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh',
                backgroundColor: '#ffffff',
            }}
        >
            {/* Left Column */}
            <Box
                sx={{
                    width: '120%',
                    px: 0,
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
                        height: '100%',
                        backgroundImage: 'url(/images/login-bg.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '0px',
                    }}
                />
            </Box>

            {/* Right Column - Login Form */}
            <Box
                sx={{
                    width: '60%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
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

                        {/* Password Field with toggle */}
                        <TextField
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
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
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            aria-label="toggle password visibility"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Error Message */}
                        {error && (
                            <Typography color="error" sx={{
                                fontSize: '14px',
                                textAlign: 'left',
                                whiteSpace: 'pre-line',
                                marginBottom: '16px'
                            }}>
                                {error}
                            </Typography>
                        )}

                        {/* Login Button */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{
                                    height: '40px',
                                    width: '120px',
                                    fontWeight: '600',
                                    backgroundColor: blue,
                                    color: '#ffffff',
                                    borderRadius: '20px',
                                    textTransform: 'none',
                                    fontSize: '16px',
                                    marginTop: '8px',
                                    '&:hover': {
                                        backgroundColor: '#16a085',
                                    },
                                }}
                            >
                                LogIn
                            </Button>
                        </Box>
                    </Box>

                    {/* Forgot Password Link */}
                    <Typography
                        sx={{
                            marginTop: '16px',
                            fontSize: '16px',
                            color: blue,
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontFamily: 'Poppins',
                            fontWeight: 500,
                            '&:hover': {
                                textDecoration: 'underline',
                            },
                        }}
                        onClick={handleForgotPassword}
                    >
                        Forgot password?
                    </Typography>

                    {/* Sign Up Link */}
                    <Typography
                        sx={{
                            marginTop: '24px',
                            fontSize: '16px',
                            color: '#000000',
                            textAlign: 'left',
                            fontFamily: 'Poppins',
                        }}
                    >
                        Don't have an account?{' '}
                        <span
                            onClick={authContext?.redirectToSignUp}
                            style={{
                                fontWeight: 500,
                                cursor: 'pointer',
                                color: blue,
                                textDecoration: 'underline',
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