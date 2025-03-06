import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface DescriptionInputProps {
    name: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
}

const DescriptionInput: React.FC<DescriptionInputProps> = ({ name, label, value, onChange }) => {
    const handleChange = (content: string) => {
        onChange(content);
    };

    const modules = {
        toolbar: [
            [{ 'header': '1'}, { 'header': '2'}, { 'font': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['blockquote', 'code-block'],
            ['link', 'image'],
            ['clean']
        ],
    };

    const formats = [
        'header', 'font', 'list', 'bullet',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background', 'align',
        'blockquote', 'code-block',
        'link', 'image'
    ];

    return (
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start' }}>
            <label htmlFor={name} style={{ marginRight: '1rem', fontSize: '1rem', color: '#1e3a8a', minWidth: '150px' }}>
                {label}
            </label>
            <div style={{ flex: 1 }}>
                <ReactQuill
                    theme="snow"
                    value={value}
                    onChange={handleChange}
                    modules={modules}
                    formats={formats}
                    style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '6px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #93c5fd',
                        minHeight: '200px',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        margin: 0,
                        padding: 0,
                        overflow: 'auto',
                    }}
                />
            </div>
        </div>
    );
};

export default DescriptionInput;
