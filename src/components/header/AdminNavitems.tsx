import { ReactNode } from 'react';

import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ReviewsRoundedIcon from '@mui/icons-material/ReviewsRounded';

export interface NavItem {
    to: string;
    icon?: ReactNode;
    label?: string;
}

const adminNavItems: NavItem[] = [
    {
        to: '/users',
        icon: <PeopleAltRoundedIcon />,
        label: 'Users'
    },
    {
        to: '/feedbacks',
        icon: <ReviewsRoundedIcon />,
        label: 'Feedbacks'
    }
];

export default adminNavItems;