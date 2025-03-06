export type FieldType = 'text' | 'number' | 'checkbox' | 'array' | 'image' | 'description';

export interface Field {
    name: string;
    label: string;
    type?: FieldType;
    required?: boolean;
    path?: string;
}

export interface Section {
    header: string;
    fields: Field[];
}

export interface SidebarConfigItem {
    label: string;
    sections: Section[];
}

export type UpdateType = 'store' | 'product';