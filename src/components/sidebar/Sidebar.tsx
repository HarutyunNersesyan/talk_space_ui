import React, { useState } from 'react';
import { Box, Drawer, List, Divider } from '@mui/material';
import SidebarHeader from './SidebarHeader';
import SidebarMenu from './SidebarMenu';
import './Sidebar.css';

const drawerWidth = '17%';
const drawerCollapsedWidth = '9%';

const Sidebar: React.FC = () => {
    const [open, setOpen] = useState(true);

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: open ? drawerWidth : drawerCollapsedWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: open ? drawerWidth : drawerCollapsedWidth,
                    backgroundColor: '#242939',
                    color: '#C0C4D1',
                    boxSizing: 'border-box',
                    transition: 'width 0.3s',
                },
            }}
        >
            <SidebarHeader open={open} onToggle={handleDrawerToggle} />
            <Divider />
            <Box>
                <SidebarMenu />
                <Divider />
            </Box>
        </Drawer>
    );
};

export default Sidebar;
