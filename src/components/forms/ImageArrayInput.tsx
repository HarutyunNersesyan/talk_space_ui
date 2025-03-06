import React, { useState } from 'react';

interface ImageArrayInputProps {
    name: string;
    label: string;
    value: string | string[];
    onChange: (newValue: string | string[]) => void;
    multiple?: boolean;
}

const ImageArrayInput: React.FC<ImageArrayInputProps> = ({ name, label, value, onChange, multiple = true }) => {
    const [newImages, setNewImages] = useState<File[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setNewImages([...newImages, ...Array.from(event.target.files)]);
        }
    };

    const handleUpload = () => {
        if (newImages.length > 0) {
            const currentImages = Array.isArray(value) ? value : [];

            const readers = newImages.map(file => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(readers).then(imageUrls => {
                if (multiple) {
                    onChange([...currentImages, ...imageUrls]);
                } else {
                    onChange(imageUrls[0]);
                }
                setNewImages([]);
            });
        }
    };

    const handleRemove = () => {
        if (selectedIndex !== null) {
            if (multiple) {
                const updatedImages = (value as string[]).filter((_, i) => i !== selectedIndex);
                onChange(updatedImages);
            } else {
                onChange('');
            }
            setSelectedIndex(null);
        }
    };

    const displayImages = multiple ? (Array.isArray(value) ? value : []) : (value ? [value] : []);

    return (
        <div style={{ padding: '2rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '700px', margin: '0 auto', border: '1px solid #e5e7eb' }}>
            <label style={{ display: 'block', marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: '700', color: '#1f2937' }}>
                {label}
            </label>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                multiple={multiple}
                style={{ marginBottom: '1.5rem', padding: '0.75rem', fontSize: '1rem', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', width: '100%', cursor: 'pointer' }}
            />
            <button
                onClick={handleUpload}
                style={{
                    display: 'block',
                    marginBottom: '1.5rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    transition: 'background-color 0.3s ease, transform 0.2s ease',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
                disabled={newImages.length === 0}
            >
                Upload Images
            </button>
            {displayImages.length > 0 && (
                <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                    {displayImages.map((imageUrl, index) => (
                        <div
                            key={index}
                            style={{
                                position: 'relative',
                                width: '120px',
                                height: '120px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                boxShadow: selectedIndex === index ? '0 4px 8px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
                                border: selectedIndex === index ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                                backgroundColor: '#f9fafb',
                                transition: 'box-shadow 0.3s ease, border 0.3s ease',
                            }}
                            onClick={() => setSelectedIndex(index)}
                        >
                            <img
                                src={imageUrl as string}
                                alt={`Uploaded ${index}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '8px'
                                }}
                            />
                            {selectedIndex === index && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove();
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        padding: '0.5rem',
                                        backgroundColor: '#ef4444',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        transition: 'background-color 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageArrayInput;
