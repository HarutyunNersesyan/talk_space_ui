import React, {useState, useRef, useEffect} from 'react';
import {Box, Button, CircularProgress, Stack, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';

const VerifyPage = () => {
    const navigate = useNavigate();

    const [pinArray, setPinArray] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState<string | string[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);


    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    const handleInputChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return;

        const newPinArray = [...pinArray];
        newPinArray[index] = value;
        setPinArray(newPinArray);

        if (value && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !pinArray[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = () => {
        const pin = pinArray.join('');
        if (pin.length !== 6) {
            setError('Please enter a 6-digit code');
            return;
        }

        setError(null);
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            if (pin === '123456') {
                alert('Verified successfully!');
                // Navigation or success action
            } else {
                setError('Invalid verification code');
            }
        }, 1500);
    };

    return (
        <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            zIndex: 0,
        }}>
            {/* Background image */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'url(/images/verify.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 1
            }}/>

            {/* Centered content */}
            <Box sx={{
                position: 'absolute',
                top: '60%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
                width: '100%',
                maxWidth: 450,
                textAlign: 'center',
                px: 2
            }}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 5}}>
                    {pinArray.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            value={digit}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            maxLength={1}
                            inputMode="numeric"
                            style={{
                                width: '55px',
                                height: '70px',
                                textAlign: 'center',
                                fontSize: '28px',
                                border: '2px solid #1976d2',
                                borderRadius: '8px',
                                outline: 'none',
                                backgroundColor: 'white'
                            }}
                        />
                    ))}
                </Box>

                {error && (
                    <Typography color="error" sx={{mb: 2}}>
                        {Array.isArray(error) ? error.join(', ') : error}
                    </Typography>
                )}

                <Stack direction="row" spacing={2}>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate(-1)}
                        sx={{py: 1.5, fontWeight: 'bold'}}
                    >
                        Cancel
                    </Button>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleVerify}
                        disabled={isLoading}
                        sx={{
                            py: 1.5,
                            fontWeight: 'bold',
                            backgroundColor: '#1976d2'
                        }}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit"/> : 'Verify'}
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
};

export default VerifyPage;
