import React, { useState, useEffect, FormEvent, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FormField from './FormField';
import ErrorMessage from './ErrorMessage';
import { Button, Container, Typography, Paper, Box } from '@mui/material';
import { grey, blue, green } from '@mui/material/colors';
import { AuthContext, AuthContextType } from '../../context/AuthContext';

const apiUrl = process.env.REACT_APP_API_URL;

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();
    const authContext = useContext(AuthContext) as AuthContextType;

    useEffect(() => {
        setEmail('');
        setPassword('');
        setError('');
    }, []);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post<{ token: string; userName: string }>(`${apiUrl}/account/auth`, {
                email,
                password,
            });

            console.log('API Response:', response.data); // Debug: Check the response

            // Store the token and userName in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userName', response.data.userName);

            console.log('Stored in localStorage:', { // Debug: Check localStorage
                token: localStorage.getItem('token'),
                userName: localStorage.getItem('userName'),
            });

            // Update the AuthContext with the userName
            authContext.setUser(response.data.userName);

            // Redirect to the dashboard
            navigate('/dashboard');
        } catch (err) {
            setError('Wrong email or password');
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                width: '100%',
                backgroundColor: '#95a0ab',
                overflow: 'hidden',
                position: 'absolute',
                top: 0,
                left: 0,
            }}
        >
            <Container
                maxWidth="sm"
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 2,
                    width: '100%',
                    height: '100%',
                    margin: 0,
                }}
            >
                <Paper
                    elevation={12}
                    sx={{
                        padding: 4,
                        width: '100%',
                        maxWidth: 500,
                        borderRadius: 3,
                        backgroundColor: grey[100],
                        boxShadow: `0 10px 20px ${grey[500]}`,
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="h3" gutterBottom sx={{ color: blue[800] }}>
                        Login to TalkSpace
                    </Typography>
                    <form onSubmit={handleLogin}>
                        <FormField
                            name="email"
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ marginBottom: 2 }}
                        />
                        <FormField
                            name="password"
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ marginBottom: 2 }}
                        />
                        <ErrorMessage message={error} />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ marginTop: 2, padding: '12px 0', fontWeight: 'bold', borderRadius: 20 }}
                        >
                            Login
                        </Button>
                    </form>

                    <Typography
                        variant="body2"
                        sx={{ marginTop: 2, color: blue[800], fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={authContext.redirectToForgotPassword}
                    >
                        Forgot Password?
                    </Typography>

                    <Typography variant="body2" sx={{ marginTop: 2, color: 'gray' }}>
                        You don't have an account yet?{' '}
                        <span
                            style={{ color: green[800], fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={authContext.redirectToSignUp}
                        >
                            Create new account.
                        </span>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};

export default LoginForm;