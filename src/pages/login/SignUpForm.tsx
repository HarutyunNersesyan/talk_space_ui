import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FormField from './FormField';
import ErrorMessage from './ErrorMessage';
import { Button, Container, Typography, Paper, Box, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { grey, blue } from '@mui/material/colors';

const apiUrl = process.env.REACT_APP_API_URL;

const SignUpForm: React.FC = () => {
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [birthDate, setBirthDate] = useState<string>('');
    const [gender, setGender] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    const handleSignUp = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await axios.post(`${apiUrl}/api/public/user/signUp`, {
                firstName,
                lastName,
                userName,
                birthDate,
                gender,
                email,
                password,
            });

            navigate('/login');
        } catch (err) {
            setError('Sign up failed. Please try again.');
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
            <Container maxWidth="sm">
                <Paper
                    elevation={12}
                    sx={{
                        padding: 4,
                        width: '100%',
                        maxWidth: 500,
                        borderRadius: 3,
                        backgroundColor: grey[100],
                        boxShadow: `0 10px 20px ${grey[500]}`,
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h3" gutterBottom sx={{ color: blue[800] }}>
                        Sign Up
                    </Typography>
                    <form onSubmit={handleSignUp}>
                        <FormField
                            name="firstName"
                            label="First Name"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            sx={{ marginBottom: 2 }}
                        />
                        <FormField
                            name="lastName"
                            label="Last Name"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            sx={{ marginBottom: 2 }}
                        />
                        <FormField
                            name="userName"
                            label="Username"
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            sx={{ marginBottom: 2 }}
                        />
                        <FormField
                            name="birthDate"
                            label="Birth Date"
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            sx={{ marginBottom: 2 }}
                        />

                        <FormControl fullWidth sx={{ marginBottom: 2 }}>
                            <InputLabel>Gender</InputLabel>
                            <Select value={gender} onChange={(e) => setGender(e.target.value)} required>
                                <MenuItem value="MALE">Male</MenuItem>
                                <MenuItem value="FEMALE">Female</MenuItem>
                                <MenuItem value="OTHER">Other</MenuItem>
                            </Select>
                        </FormControl>

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
                            Sign Up
                        </Button>
                    </form>
                    <Typography variant="body2" sx={{ marginTop: 2 }}>
                        Already have an account?{' '}
                        <Typography
                            component="span"
                            sx={{
                                color: blue[800],
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontWeight: 'bold',
                            }}
                            onClick={() => navigate('/login')}
                        >
                            Sign In
                        </Typography>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};

export default SignUpForm;
