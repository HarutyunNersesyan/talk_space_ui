import React, { useState, FormEvent, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
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
const blue = '#1abc9c'; // Same blue color from SignUpForm

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
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

    const handleForgotPassword = () => {
        navigate('/forgotPassword');
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
                    width: '55%',
                    px: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    position: 'relative',
                }}
            >
                {/* Logo and App Name */}
                <Box sx={{ display: 'flex', alignItems: 'center', position: 'absolute', top: 1, left: 30 }}>
                    <Box
                        component="img"
                        src="/images/logo.jpg"
                        alt="TalkSpace Logo"
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            marginRight: 1,
                        }}
                    />
                    <Typography variant="h6" sx={{ color: '#000', fontWeight: 600 }}>
                        TalkSpace
                    </Typography>
                </Box>

                {/* Background Image */}
                <Box
                    sx={{
                        width: '100%',
                        height: 'calc(100% - 120px)',
                        backgroundImage: 'url(/images/login-bg.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '20px',
                        marginTop: '100px',
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
                            <Typography color="error" sx={{ fontSize: '14px', textAlign: 'center' }}>
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
                            onClick={authContext.redirectToSignUp}
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
