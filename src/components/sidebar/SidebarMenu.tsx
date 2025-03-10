import React from 'react';
import { List, Typography } from '@mui/material';
import MenuItem from './MenuItem';
import CollapsibleMenuSection from './CollapsibleMenuSection';

const menuItems: MenuItemType[] = [
    { type: 'item', text: 'Home page', to: '/dashboard' },
    { type: 'collapsible', title: 'Chats', items: [
        ]},
    {
        type: 'collapsible',
        title: 'My profile',
        items: [
            { text: 'Update hobbies', to: '/api/public/user/updateHobbies' },
            { text: 'Update specialities', to: '/api/public/user/updateSpecialities' },
            { text: 'Update social networks ', to: '/api/public/user/update/socialNetworks' },
            { text: 'Update education', to: '/api/public/user/update/education' },
            { text: 'Update images', to: '/api/public/user/images/upload' },
        ],
    },
    { type: 'collapsible', title: 'Hobbies', items: [
        ]},
    { type: 'collapsible', title: 'Specialities', items: [
        ]},
    { type: 'collapsible', title: 'Search', items: [
            { text: 'Search by hobbies', to: '/api/public/user/searchByHobbies' },
            { text: 'Search by specialities', to: '/api/public/user/searchBySpecialities' },
        ]},
];

const SidebarMenu: React.FC = () => {
    return (
        <List>
            {menuItems.map((item, index) => {
                if (item.type === 'item') {
                    return <MenuItem key={index} text={item.text!} to={item.to!} />;
                } else if (item.type === 'section-title') {
                    return (
                        <Typography
                            key={index}
                            variant="body2"
                            sx={{
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                marginLeft: 2,
                            }}
                        >
                            {item.text}
                        </Typography>
                    );
                } else if (item.type === 'collapsible' && item.items) {
                    return (
                        <CollapsibleMenuSection key={index} title={item.title!}>
                            {item.items.map((subItem, subIndex) => (
                                <MenuItem key={subIndex} text={subItem.text} to={subItem.to} />
                            ))}
                        </CollapsibleMenuSection>
                    );
                }
                return null;
            })}
        </List>
    );
};

export default SidebarMenu;
