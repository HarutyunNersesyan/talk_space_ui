import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Button,
    Container,
    Typography,
    Paper,
    Box,
    Grid,
    InputAdornment,
    IconButton,
    TextField,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import { Visibility, VisibilityOff, Female, Male } from '@mui/icons-material';

const apiUrl = process.env.REACT_APP_API_URL;

const SignUpForm: React.FC = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [userName, setUserName] = useState('');
    const [birthDate, setBirthDate] = useState('2000-01-01');
    const [gender, setGender] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string[]>([]);
    const navigate = useNavigate();

    const blue = '#1abc9c';

    const handleSignUp = async (e: FormEvent) => {
        e.preventDefault();
        setError([]);

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

            navigate('/verify', { state: { email } });
        } catch (err: any) {
            if (err.response?.data) {
                // Handle different backend response formats
                const errorData = err.response.data;
                if (Array.isArray(errorData)) {
                    setError(errorData);
                } else if (typeof errorData === 'string') {
                    setError([errorData]);
                } else if (errorData.message) {
                    setError([errorData.message]);
                } else {
                    setError(['Sign up failed. Please try again.']);
                }
            } else if (err.request) {
                setError(['No response from server. Please check your connection.']);
            } else {
                setError(['Sign up failed. Please try again.']);
            }
        }
    };

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    const renderTextField = (
        label: string,
        value: string,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
        name: string,
        type: string = 'text'
    ) => (
        <TextField
            name={name}
            label={label}
            variant="outlined"
            type={type}
            fullWidth
            value={value}
            onChange={onChange}
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
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', fontFamily: 'Poppins' }}>
            {/* Left Side with Logo and Image */}
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
                {/* Header: Logo and TalkSpace Text */}
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
                            Create a new account
                        </Typography>
                        <form onSubmit={handleSignUp}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} sx={{ mt: 1 }}>
                                    {renderTextField('First Name', firstName, e => setFirstName(e.target.value), 'firstName')}
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ mt: 1 }}>
                                    {renderTextField('Last Name', lastName, e => setLastName(e.target.value), 'lastName')}
                                </Grid>
                                <Grid item xs={12}>
                                    {renderTextField('Username', userName, e => setUserName(e.target.value), 'userName')}
                                </Grid>

                                {/* Birth Date */}
                                <Grid item xs={4}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Month"
                                        value={birthDate.split('-')[1]}
                                        onChange={e =>
                                            setBirthDate(`${birthDate.split('-')[0]}-${e.target.value}-${birthDate.split('-')[2]}`)
                                        }
                                        SelectProps={{ native: true }}
                                        sx={{ '& label': { color: blue }, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                            </option>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Day"
                                        value={birthDate.split('-')[2]}
                                        onChange={e =>
                                            setBirthDate(`${birthDate.split('-')[0]}-${birthDate.split('-')[1]}-${e.target.value}`)
                                        }
                                        SelectProps={{ native: true }}
                                        sx={{ '& label': { color: blue }, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    >
                                        {Array.from({ length: 31 }, (_, i) => (
                                            <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                                                {i + 1}
                                            </option>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Year"
                                        value={birthDate.split('-')[0]}
                                        onChange={e =>
                                            setBirthDate(`${e.target.value}-${birthDate.split('-')[1]}-${birthDate.split('-')[2]}`)
                                        }
                                        SelectProps={{ native: true }}
                                        sx={{ '& label': { color: blue }, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    >
                                        {Array.from({ length: 100 }, (_, i) => {
                                            const year = new Date().getFullYear() - i;
                                            return (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            );
                                        })}
                                    </TextField>
                                </Grid>

                                {/* Gender */}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" sx={{ mb: 1, color: blue }}>
                                        Gender
                                    </Typography>
                                    <ToggleButtonGroup
                                        value={gender}
                                        exclusive
                                        onChange={(e, val) => val && setGender(val)}
                                        fullWidth
                                    >
                                        <ToggleButton value="MALE" sx={{ py: 1, borderRadius: '10px' }}>
                                            <Male sx={{ mr: 1 }} /> Male
                                        </ToggleButton>
                                        <ToggleButton value="FEMALE" sx={{ py: 1, borderRadius: '10px' }}>
                                            <Female sx={{ mr: 1 }} /> Female
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </Grid>

                                <Grid item xs={12}>
                                    {renderTextField('Email', email, e => setEmail(e.target.value), 'email', 'email')}
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="password"
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        fullWidth
                                        variant="outlined"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            borderRadius: '20px',
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '20px',
                                                '& fieldset': { borderColor: blue },
                                                '&:hover fieldset': { borderColor: blue },
                                                '&.Mui-focused fieldset': { borderColor: blue },
                                            },
                                            '& .MuiInputLabel-root': { color: blue },
                                        }}
                                    />
                                </Grid>

                                {/* Error Messages */}
                                {error.length > 0 && (
                                    <Grid item xs={12}>
                                        <Box mt={1} color="error.main">
                                            {error.map((msg, idx) => (
                                                <Typography key={idx} variant="body2" sx={{ color: 'red' }}>
                                                    {msg}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Grid>
                                )}

                                {/* Register Button */}
                                <Grid item xs={12}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        sx={{
                                            mt: 2,
                                            px: 4,
                                            py: 1,
                                            fontSize: '0.85rem',
                                            backgroundColor: blue,
                                            fontWeight: 'bold',
                                            borderRadius: 20,
                                            textTransform: 'none',
                                            fontFamily: 'Poppins',
                                            alignSelf: 'flex-start',
                                            '&:hover': {
                                                backgroundColor: '#16a085',
                                            },
                                        }}
                                    >
                                        Sign Up
                                    </Button>
                                </Grid>

                                {/* Login Redirect */}
                                <Grid item xs={12}>
                                    <Typography variant="body1" sx={{ marginTop: 2, fontFamily: 'Poppins', fontSize: '1rem' }}>
                                        Already have an account?{' '}
                                        <span
                                            style={{ color: blue, cursor: 'pointer', fontWeight: 500 }}
                                            onClick={handleLoginRedirect}
                                        >
                                            Log in
                                        </span>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
};

export default SignUpForm;