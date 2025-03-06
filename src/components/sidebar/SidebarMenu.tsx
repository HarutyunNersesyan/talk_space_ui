import React from 'react';
import { List, Typography } from '@mui/material';
import MenuItem from './MenuItem';
import CollapsibleMenuSection from './CollapsibleMenuSection';

const menuItems: MenuItemType[] = [
    { type: 'item', text: 'Dashboard', to: '/dashboard' },
    { type: 'section-title', text: 'Options' },
    { type: 'collapsible', title: 'Sales', items: [
            { text: 'Orders', to: '/sales/orders' },
            { text: 'Abandoned Orders', to: '/sales/abandoned-orders' },
        ]},
    { type: 'collapsible', title: 'Reports', items: [
            { text: 'Shipping Report', to: '/reports/shipping' },
        ]},
    { type: 'collapsible', title: 'Catalog', items: [
            { text: 'Products', to: '/catalog/products' },
            { text: 'Create Product', to: '/catalog/create-product' },
            { text: 'Categories', to: '/catalog/categories' },
            { text: 'Create Category', to: '/catalog/create-category' },
            { text: 'Attributes', to: '/catalog/attributes' },
        ]},
    { type: 'collapsible', title: 'Promotions', items: [
            { text: 'Promotions', to: '/promotions' },
            { text: 'Create Promotion', to: '/promotions/create' },
        ]},
    { type: 'collapsible', title: 'Customers', items: [
            { text: 'Customers', to: '/customers' },
            { text: 'Create Customer', to: '/customers/create' },
        ]},
    { type: 'section-title', text: 'Content' },
    { type: 'collapsible', title: 'Page', items: [
            { text: 'Pages', to: '/content/pages' },
            { text: 'Create Page', to: '/content/create-page' },
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
