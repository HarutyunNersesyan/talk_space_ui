import React, {useState, FormEvent} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import FormField from './FormField';
import ErrorMessage from './ErrorMessage';
import {Button, Container, Typography, Paper, Box} from '@mui/material';
import {grey, blue} from '@mui/material/colors';

const apiUrl = process.env.REACT_APP_API_URL;

const ForgotPasswordForm: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleForgotPassword = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.put(`${apiUrl}/api/public/user/forgotPassword`, {email});

            if (response.status === 200) {
                // Redirect to the login page with a success message
                navigate('/login', {state: {message: 'A new password has been sent to your email.'}});
            }
        } catch (err: any) {
            if (err.response) {
                // Backend responded with an error
                if (err.response.status === 500) {
                    setError('No account found with this email address.');
                } else {
                    setError(err.response.data || 'Failed to reset password. Please try again.');
                }
            } else if (err.request) {
                // No response from the server
                setError('No response from the server. Please check your connection and try again.');
            } else {
                // Something went wrong in setting up the request
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/login'); // Redirect to the login page
    };

    return (
        <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'}}>
            <Container maxWidth="sm">
                <Paper elevation={12} sx={{padding: 4, textAlign: 'center', backgroundColor: grey[100]}}>
                    <Typography variant="h6" gutterBottom sx={{color: blue[800]}}>
                        Enter your email address
                    </Typography>
                    <form onSubmit={handleForgotPassword}>
                        <FormField
                            name="email"
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        {/* Display backend validation errors */}
                        <ErrorMessage message={error}/>

                        {/* Reset Password Button */}
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={isLoading}
                            sx={{marginTop: 2, padding: '12px 0', fontWeight: 'bold', borderRadius: 20}}
                        >
                            {isLoading ? 'Sending...' : 'Reset Password'}
                        </Button>

                        {/* Cancel Button */}
                        <Button
                            type="button"
                            variant="outlined"
                            color="secondary"
                            fullWidth
                            onClick={handleCancel}
                            sx={{marginTop: 2, padding: '12px 0', fontWeight: 'bold', borderRadius: 20}}
                        >
                            Cancel
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default ForgotPasswordForm;