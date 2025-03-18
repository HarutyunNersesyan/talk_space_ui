import { ReactNode } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';

export interface NavItem {
    to: string;
    icon?: ReactNode;
    label?: string;
}

const navItems: NavItem[] = [
    { to: '/profile', icon: <SettingsIcon />, label: 'Profile' }, // Updated to point to /profile
    { to: '/account', label: 'Account' },
];

export default navItems;