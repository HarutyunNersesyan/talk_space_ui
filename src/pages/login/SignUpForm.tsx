import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FormField from './FormField';
import ErrorMessage from './ErrorMessage';
import { Button, Container, Typography, Paper, Box, IconButton, InputAdornment } from '@mui/material';
import { grey, blue } from '@mui/material/colors';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const apiUrl = process.env.REACT_APP_API_URL;

const SignUpForm: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        userName: '',
        birthDate: '',
        email: '',
        password: '',
        gender: 'MALE', // Default selection
    });

    const [error, setError] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignUp = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await axios.post(`${apiUrl}/api/public/user/signUp`, formData);
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Sign up failed. Please check your details.');
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
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h3" gutterBottom sx={{ color: blue[800] }}>
                        Sign Up
                    </Typography>
                    <form onSubmit={handleSignUp}>
                        <FormField
                            label="First Name"
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            pattern="[A-Z][a-z]+"
                            errorMessage="First name must start with an uppercase letter."
                        />
                        <FormField
                            label="Last Name"
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            pattern="[A-Z][a-z]+"
                            errorMessage="Last name must start with an uppercase letter."
                        />
                        <FormField
                            label="Username"
                            type="text"
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="Birth Date"
                            type="date"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+])[a-zA-Z0-9!@#$%^&*()_+]{8,20}$"
                            errorMessage="Password must be 8-20 characters with uppercase, lowercase, number, and special character."
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormField
                            label="Gender"
                            type="select"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            options={[
                                { value: 'MALE', label: 'Male' },
                                { value: 'FEMALE', label: 'Female' },
                            ]}
                            required
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
                        Уже есть аккаунт? <Button onClick={() => navigate('/login')}>Login</Button>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};

export default SignUpForm;
