import { ReactNode } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home'; // Import Home icon
import InfoIcon from '@mui/icons-material/Info'; // Import About Us icon
import SearchIcon from '@mui/icons-material/Search'; // Import Search icon

export interface NavItem {
    to: string;
    icon?: ReactNode;
    label?: string;
}

const navItems: NavItem[] = [
    { to: '/', icon: <HomeIcon />, label: 'Home' }, // Home button
    { to: '/about', icon: <InfoIcon />, label: 'About Us' }, // About Us button
    { to: '/profile', icon: <SettingsIcon />, label: 'Profile' }, // Profile button
    { to: '/search', icon: <SearchIcon />, label: 'Search' }, // Search button
];

export default navItems;