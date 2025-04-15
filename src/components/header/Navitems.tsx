import { ReactNode } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';

export interface NavItem {
    to: string;
    icon?: ReactNode;
    label?: string;
}

const navItems: NavItem[] = [
    { to: '/', icon: <HomeIcon />, label: 'Home' },
    { to: '/about', icon: <InfoIcon />, label: 'About Us' },
    { to: '/profile', icon: <SettingsIcon />, label: 'Profile' },
    { to: '/choose', icon: <SearchIcon />, label: 'Search' },
    { to: '/chat', icon: <ChatIcon />, label: 'Chat' },
];

export default navItems;