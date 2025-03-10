import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FormField from './FormField';
import ErrorMessage from './ErrorMessage';
import { Button, Container, Typography, Paper, Box } from '@mui/material';
import { grey, blue } from '@mui/material/colors';

const apiUrl = process.env.REACT_APP_API_URL;

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();


    useEffect(() => {
        setEmail('');
        setPassword('');
        setError('');
    }, []);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post<{ token: string }>(`${apiUrl}/account/auth`, {
                email,
                password,
            });

            localStorage.setItem('token', response.data.token);
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
                            Sign In
                        </Button>
                    </form>
                    <Typography variant="body2" sx={{ marginTop: 2 }}>
                    </Typography>
                    <Button
                        variant="outlined"
                        color="secondary"
                        fullWidth
                        sx={{ marginTop: 1, padding: '10px 0', fontWeight: 'bold', borderRadius: 20 }}
                        onClick={() => navigate('/signup')}
                    >
                        Sign Up
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
};

export default LoginForm;
