import { ReactNode } from 'react';


export interface NavItem {
    to: string;
    icon?: ReactNode;
    label?: string;
}

const adminNavItems: NavItem[] = [
];

export default adminNavItems;