import React from 'react';
import { TextField, MenuItem, SxProps, InputAdornment } from '@mui/material';
import { Theme } from '@mui/material/styles';

interface FormFieldProps {
    label: string;
    type: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    pattern?: string;
    errorMessage?: string;
    InputProps?: {
        endAdornment?: React.ReactNode;
    };
    options?: { value: string; label: string }[];
    sx?: SxProps<Theme>;
}

const FormField: React.FC<FormFieldProps> = ({
                                                 label,
                                                 type,
                                                 name,
                                                 value,
                                                 onChange,
                                                 required,
                                                 pattern,
                                                 errorMessage,
                                                 InputProps,
                                                 options,
                                                 sx,
                                             }) => {
    return (
        <TextField
            label={label}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={sx}
            InputProps={InputProps}
            error={!!errorMessage}
            helperText={errorMessage}
            {...(type === 'select'
                ? {
                    select: true,
                    children: options?.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    )),
                }
                : {})}
        />
    );
};

export default FormField;
