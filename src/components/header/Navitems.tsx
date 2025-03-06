import { ReactNode } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';

export interface NavItem {
    to: string;
    icon?: ReactNode;
    label?: string;
}

const navItems: NavItem[] = [
    { to: '/settings', icon: <SettingsIcon /> },
    { to: '/store', label: 'Store' },
    { to: '/account', label: 'Account' },
];

export default navItems;
