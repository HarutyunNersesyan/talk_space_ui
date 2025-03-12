import React from 'react';
import { TextField } from '@mui/material';

interface FormFieldProps {
    name: string;
    label: string;
    type: string;
    value: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    sx?: object;
    disabled?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({ name, label, type, value, onChange, sx, disabled }) => {
    return (
        <TextField
            fullWidth
            variant="outlined"
            name={name}
            label={label}
            type={type}
            value={value}
            onChange={onChange}
            sx={sx}
            disabled={disabled}
            InputProps={{ readOnly: disabled }}
        />
    );
};

export default FormField;
