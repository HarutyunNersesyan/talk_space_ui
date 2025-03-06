import React from 'react';
import ArrayInputFields from './ArrayInputFields';
import ImageArrayInput from './ImageArrayInput';
import DescriptionInput from './DescriptionInput';
import { FieldType } from "../../models/types";

interface InputField {
    name: string;
    label: string;
    type: FieldType;
    value?: string | number | boolean | string[];
    required?: boolean;
    onChange: (value: string | number | boolean | string[]) => void;
}

interface InputFieldProps {
    inputs: InputField[];
}

const InputFields: React.FC<InputFieldProps> = ({ inputs }) => {
    const handleChange = (name: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const { type, value, checked } = event.target;
        let inputValue: string | number | boolean;
        if (type === 'number') {
            inputValue = Number(value);
        } else if (type === 'checkbox') {
            inputValue = checked;
        } else {
            inputValue = value;
        }
        inputs.find(input => input.name === name)?.onChange(inputValue);
    };

    return (
        <div style={{ padding: '2rem', backgroundColor: 'transparent', borderRadius: '8px' }}>
            {inputs.map((input, index) => {
                const isRequired = input.required && !input.value;

                if (input.type === 'description') {
                    return (
                        <DescriptionInput
                            key={index}
                            name={input.name}
                            label={input.label}
                            value={input.value as string}
                            onChange={(newValue) => input.onChange(newValue)}
                        />
                    );
                }

                if (input.type === 'image') {
                    return (
                        <ImageArrayInput
                            key={index}
                            name={input.name}
                            label={input.label}
                            value={input.value as string[]}
                            onChange={(newValue) => input.onChange(newValue)}
                        />
                    );
                }

                if (input.type === 'array' || Array.isArray(input.value)) {
                    return (
                        <ArrayInputFields
                            key={index}
                            name={input.name}
                            label={input.label}
                            value={input.value as string[]}
                            onChange={(newValue) => input.onChange(newValue)}
                        />
                    );
                }

                return (
                    <div key={index} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                        <label htmlFor={input.name} style={{ width: '200px', marginRight: '1rem', fontSize: '1rem', color: isRequired ? 'red' : '#1e3a8a' }}>
                            {input.label}
                        </label>
                        {input.type === 'checkbox' ? (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <label style={{ position: 'relative' }}>
                                    <input
                                        id={input.name}
                                        type="checkbox"
                                        checked={input.value as boolean}
                                        onChange={(e) => handleChange(input.name, e)}
                                        style={{
                                            opacity: 0,
                                            width: 0,
                                            height: 0,
                                            position: 'absolute',
                                        }}
                                    />
                                    <span style={{
                                        display: 'inline-block',
                                        width: '50px',
                                        height: '30px',
                                        borderRadius: '30px',
                                        backgroundColor: (input.value as boolean) ? '#3b82f6' : '#cfd8dc',
                                        position: 'relative',
                                        transition: 'background-color 0.3s ease',
                                        cursor: 'pointer',
                                    }}>
                                        <span style={{
                                            display: 'block',
                                            width: '22px',
                                            height: '22px',
                                            borderRadius: '50%',
                                            backgroundColor: '#ffffff',
                                            position: 'absolute',
                                            top: '4px',
                                            left: (input.value as boolean) ? 'calc(100% - 26px)' : '4px',
                                            transition: 'left 0.3s ease',
                                        }} />
                                    </span>
                                </label>
                            </div>
                        ) : (
                            <input
                                id={input.name}
                                type={input.type}
                                value={input.type === 'number' ? (input.value as number) ?? '' : (input.value as string) ?? ''}
                                onChange={(e) => handleChange(input.name, e)}
                                style={{
                                    flex: 1,
                                    padding: '12px 15px',
                                    fontSize: '1rem',
                                    border: `1px solid ${isRequired ? 'red' : '#93c5fd'}`,
                                    borderRadius: '6px',
                                    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                                    transition: 'border-color 0.3s ease, background-color 0.3s ease',
                                    backgroundColor: '#ffffff',
                                    outline: 'none',
                                }}
                                onFocus={(e) => (e.currentTarget.style.backgroundColor = '#f0f4f8')}
                                onBlur={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default InputFields;
