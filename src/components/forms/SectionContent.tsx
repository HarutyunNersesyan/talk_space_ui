import React from 'react';
import InputFields from './InputFields';
import { Section } from "../../models/types";

interface SectionContentProps {
    sections: Section[];
    data: { [key: string]: any };
    onInputChange: (name: string, value: string | number | boolean | string[], path?: string) => void;
}

const SectionContent: React.FC<SectionContentProps> = ({ sections, data, onInputChange }) => {
    return (
        <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '8px', flex: 1 }}>
            {sections.map((section, index) => (
                <div key={index} style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#0c4a6e', fontSize: '1.2rem', marginTop: '-3rem', marginBottom: '1rem', fontWeight: 'bold' }}>
                        {section.header}
                    </h2>
                    <InputFields
                        inputs={section.fields.map((field) => ({
                            name: field.name,
                            label: field.label,
                            type: field.type ?? (typeof data[field.name] === 'boolean' ? 'checkbox' : 'text'),
                            value: field.path ? field.path.split('.').reduce((o, key) => (o ? o[key] : ''), data) : data[field.name],
                            required: field.required,
                            onChange: (value: string | number | boolean | string[]) => onInputChange(field.name, value, field.path),
                        }))}
                    />
                </div>
            ))}
        </div>
    );
};

export default SectionContent;
