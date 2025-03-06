import React, { useState } from 'react';

interface ArrayInputFieldProps {
    name: string;
    label: string;
    value: string[];
    onChange: (value: string[]) => void;
}

const ArrayInputFields: React.FC<ArrayInputFieldProps> = ({ name, label, value = [], onChange }) => {
    const [newValue, setNewValue] = useState('');

    const handleAdd = () => {
        if (newValue.trim()) {
            onChange([...value, newValue.trim()]);
            setNewValue('');
        }
    };

    const handleRemove = (index: number) => {
        const newArray = value.filter((_, i) => i !== index);
        onChange(newArray);
    };

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <label htmlFor={name} style={{ width: '200px', marginRight: '1rem', fontSize: '1rem', color: '#1e3a8a' }}>
                    {label}
                </label>
                <input
                    id={name}
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '12px 15px',
                        fontSize: '1rem',
                        border: '1px solid #93c5fd',
                        borderRadius: '6px',
                        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                        backgroundColor: '#ffffff',
                        outline: 'none',
                        transition: 'border-color 0.3s ease, background-color 0.3s ease',
                    }}
                    onFocus={(e) => (e.currentTarget.style.backgroundColor = '#f0f4f8')}
                    onBlur={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    style={{
                        padding: '10px 16px',
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginLeft: '8px',
                        fontSize: '1rem',
                    }}
                >
                    Add
                </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {value.map((val, index) => (
                    <div
                        key={index}
                        style={{
                            padding: '12px 15px',
                            border: '1px solid #003366',
                            borderRadius: '6px',
                            backgroundColor: '#003366',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '100px',
                            minHeight: '50px',
                            textAlign: 'center',
                            fontSize: '0.875rem',
                            color: '#ffffff',
                            position: 'relative',
                        }}
                    >
                        {val}
                        <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '20px',
                                height: '20px',
                                backgroundColor: '#000000',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                padding: 0,
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                            }}
                        >
                            X
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ArrayInputFields;
