import { ReactNode } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import FeedbackIcon from '@mui/icons-material/Feedback';

export interface NavItem {
    to: string;
    icon?: ReactNode;
    label?: string;
}

const adminNavItems: NavItem[] = [
    { to: '/users', icon: <PeopleIcon />, label: 'Users' },
    { to: '/feedbacks', icon: <FeedbackIcon />, label: 'Feedbacks' },
];

export default adminNavItems;