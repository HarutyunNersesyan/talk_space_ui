import { ReactNode } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';

export interface NavItem {
    to: string;
    icon?: ReactNode;
    label?: string;
}

const adminNavItems: NavItem[] = [
    { to: '/settings', icon: <SettingsIcon />, label: 'Settings' },
    { to: '/users', icon: <SearchIcon />, label: 'Users' },
    { to: '/feedbacks', icon: <ChatIcon />, label: 'Feedbacks' },
];

export default adminNavItems;