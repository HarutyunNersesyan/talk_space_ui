import React, {useState, FormEvent} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import FormField from './FormField';
import ErrorMessage from './ErrorMessage';
import {
    Button,
    Container,
    Typography,
    Paper,
    Box,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Grid
} from '@mui/material';
import {grey, blue} from '@mui/material/colors';

const apiUrl = process.env.REACT_APP_API_URL;

const SignUpForm: React.FC = () => {
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
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
                userName,
                birthDate,
                gender,
                email,
                password,
            });

            navigate('/verify', {state: {email}});
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
        <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'}}>
            <Container maxWidth="sm">
                <Paper elevation={12} sx={{padding: 4, textAlign: 'center', backgroundColor: grey[100]}}>
                    <Typography variant="h3" gutterBottom sx={{color: 'black'}}>
                        Sign Up
                    </Typography>
                    <form onSubmit={handleSignUp}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormField name="firstName" label="First Name" type="text" value={firstName}
                                           onChange={(e) => setFirstName(e.target.value)}/>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormField name="lastName" label="Last Name" type="text" value={lastName}
                                           onChange={(e) => setLastName(e.target.value)}/>
                            </Grid>
                            <Grid item xs={12}>
                                <FormField name="userName" label="Username" type="text" value={userName}
                                           onChange={(e) => setUserName(e.target.value)}/>
                            </Grid>
                            <Grid item xs={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Month</InputLabel>
                                    <Select value={birthDate.split('-')[1]}
                                            onChange={(e) => setBirthDate(`${birthDate.split('-')[0]}-${e.target.value}-${birthDate.split('-')[2]}`)}>
                                        {Array.from({length: 12}, (_, i) => (
                                            <MenuItem key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                                                {new Date(0, i).toLocaleString('default', {month: 'long'})}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Day</InputLabel>
                                    <Select value={birthDate.split('-')[2]}
                                            onChange={(e) => setBirthDate(`${birthDate.split('-')[0]}-${birthDate.split('-')[1]}-${e.target.value}`)}>
                                        {Array.from({length: 31}, (_, i) => (
                                            <MenuItem key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                                                {i + 1}
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
                                        {Array.from({length: 100}, (_, i) => (
                                            <MenuItem key={i} value={(new Date().getFullYear() - i).toString()}>
                                                {new Date().getFullYear() - i}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Gender</InputLabel>
                                    <Select value={gender} onChange={(e) => setGender(e.target.value)}>
                                        <MenuItem value="MALE">Male</MenuItem>
                                        <MenuItem value="FEMALE">Female</MenuItem>
                                        <MenuItem value="OTHER">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormField name="email" label="Email" type="email" value={email}
                                           onChange={(e) => setEmail(e.target.value)}/>
                            </Grid>
                            <Grid item xs={12}>
                                <FormField name="password" label="Password" type="password" value={password}
                                           onChange={(e) => setPassword(e.target.value)}/>
                            </Grid>
                        </Grid>

                        <ErrorMessage message={error}/>

                        {/* SIGN UP Button */}
                        <Button
                            type="submit"
                            variant="contained"
                            color="success" // Green color
                            fullWidth
                            sx={{
                                marginTop: 2,
                                padding: '8px 0',
                                fontWeight: 'bold',
                                borderRadius: 20,
                                fontSize: '0.875rem'
                            }} // Smaller button
                        >
                            Sign Up
                        </Button>

                        {/* "Do you already have an account?" Link */}
                        <Typography
                            variant="body2"
                            sx={{marginTop: 2, color: blue[800], cursor: 'pointer'}}
                            onClick={handleLoginRedirect}
                        >
                            Do you already have an account? Click here to login.
                        </Typography>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default SignUpForm;