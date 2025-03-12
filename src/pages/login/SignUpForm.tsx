import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FormField from './FormField';
import ErrorMessage from './ErrorMessage';
import { Button, Container, Typography, Paper, Box, MenuItem, Select, InputLabel, FormControl, Grid, Link } from '@mui/material';
import { grey, blue } from '@mui/material/colors';

const apiUrl = process.env.REACT_APP_API_URL;

const SignUpForm: React.FC = () => {
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [birthDate, setBirthDate] = useState<string>('');
    const [gender, setGender] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | string[]>('');
    const navigate = useNavigate();

    const handleSignUp = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await axios.post(`${apiUrl}/api/public/user/signUp`, {
                firstName,
                lastName,
                birthDate,
                gender,
                email,
                password,
            });

            navigate('/verify', { state: { email } });
        } catch (err: any) {
            if (err.response && err.response.data) {
                if (Array.isArray(err.response.data)) {
                    setError(err.response.data);
                } else if (typeof err.response.data === 'string') {
                    setError([err.response.data]);
                } else {
                    setError(['Sign up failed. Please try again.']);
                }
            } else {
                setError(['Sign up failed. Please try again.']);
            }
        }
    };

    const handleLoginRedirect = () => {
        navigate('/login'); // Redirect to the login page
    };

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: grey[100]
        }}>
            <Container maxWidth="sm">
                <Paper elevation={12} sx={{ padding: 4, textAlign: 'center', backgroundColor: 'white' }}>
                    <Typography variant="h4" gutterBottom sx={{ color: 'black', fontWeight: 'bold' }}>
                        Create a new account
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom sx={{ color: grey[600], marginBottom: 4 }}>
                        It's quick and easy.
                    </Typography>
                    <form onSubmit={handleSignUp}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormField name="firstName" label="Name" type="text" value={firstName}
                                           onChange={(e) => setFirstName(e.target.value)} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormField name="lastName" label="Surname" type="text" value={lastName}
                                           onChange={(e) => setLastName(e.target.value)} />
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    <Grid item xs={4}>
                                        <FormControl fullWidth>
                                            <InputLabel>Day</InputLabel>
                                            <Select value={birthDate.split('-')[2]}
                                                    onChange={(e) => setBirthDate(`${birthDate.split('-')[0]}-${birthDate.split('-')[1]}-${e.target.value}`)}>
                                                {Array.from({ length: 31 }, (_, i) => (
                                                    <MenuItem key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                                                        {i + 1}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <FormControl fullWidth>
                                            <InputLabel>Month</InputLabel>
                                            <Select value={birthDate.split('-')[1]}
                                                    onChange={(e) => setBirthDate(`${birthDate.split('-')[0]}-${e.target.value}-${birthDate.split('-')[2]}`)}>
                                                {Array.from({ length: 12 }, (_, i) => (
                                                    <MenuItem key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                                                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <FormControl fullWidth>
                                            <InputLabel>Year</InputLabel>
                                            <Select value={birthDate.split('-')[0]}
                                                    onChange={(e) => setBirthDate(`${e.target.value}-${birthDate.split('-')[1]}-${birthDate.split('-')[2]}`)}>
                                                {Array.from({ length: 100 }, (_, i) => (
                                                    <MenuItem key={i} value={(new Date().getFullYear() - i).toString()}>
                                                        {new Date().getFullYear() - i}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    <Grid item xs={4}>
                                        <Button fullWidth variant={gender === 'FEMALE' ? 'contained' : 'outlined'}
                                                onClick={() => setGender('FEMALE')}>
                                            Woman
                                        </Button>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button fullWidth variant={gender === 'MALE' ? 'contained' : 'outlined'}
                                                onClick={() => setGender('MALE')}>
                                            Man
                                        </Button>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button fullWidth variant={gender === 'OTHER' ? 'contained' : 'outlined'}
                                                onClick={() => setGender('OTHER')}>
                                            Other
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <FormField name="email" label="Email address" type="email" value={email}
                                           onChange={(e) => setEmail(e.target.value)} />
                            </Grid>
                            <Grid item xs={12}>
                                <FormField name="password" label="New Password" type="password" value={password}
                                           onChange={(e) => setPassword(e.target.value)} />
                            </Grid>
                        </Grid>

                        <Typography variant="body2" sx={{ marginTop: 2, color: grey[600], textAlign: 'center' }}>
                            People who use our service may have uploaded your contact information to TalkSpace. <Link
                            href="#" sx={{ color: blue[800] }}>Learn more</Link>
                        </Typography>

                        <Typography variant="body2" sx={{ marginTop: 2, color: grey[600], textAlign: 'center' }}>
                            By clicking "Register" you agree to our <Link href="#" sx={{ color: blue[800] }}>Terms of
                            Use</Link>, <Link href="#" sx={{ color: blue[800] }}>Privacy Policy</Link> and <Link href="#"
                                                                                                                 sx={{ color: blue[800] }}>Cookie
                            Policy</Link>.
                        </Typography>

                        <Button
                            type="submit"
                            variant="contained"
                            color="success" // Changed to green
                            fullWidth
                            sx={{ marginTop: 2, padding: '12px 0', fontWeight: 'bold', borderRadius: 20 }}
                        >
                            Register
                        </Button>

                        <Typography
                            variant="body2"
                            sx={{ marginTop: 2, color: grey[600], textAlign: 'center' }}
                        >
                            Do you already have an account? <Link href="#" onClick={handleLoginRedirect} sx={{
                            color: blue[800],
                            cursor: 'pointer'
                        }}>Login</Link>
                        </Typography>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default SignUpForm;