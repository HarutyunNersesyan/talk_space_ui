import React from 'react';
import { ListItem, ListItemText } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

interface MenuItemProps {
    text: string;
    to: string;
    onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ text, to, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <ListItem
            button
            component={Link}
            to={to}
            onClick={onClick}
            sx={{
                backgroundColor: isActive ? '#1f2331' : 'transparent',
                color: isActive ? '#ffffff' : '#C0C4D1',
                borderRadius: 1,
                '&:hover': {
                    backgroundColor: '#242939',
                    color: 'white',
                },
            }}
        >
            <ListItemText primary={text} />
        </ListItem>
    );
};

export default MenuItem;
