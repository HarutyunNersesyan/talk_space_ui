import React from 'react';
import { Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import boostLogo from '../../assets/boost_logo.png';

interface SidebarHeaderProps {
    open: boolean;
    onToggle: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ open, onToggle }) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', padding: 2 }}>
            <img src={boostLogo} alt="Logo" style={{ width: 90, height: 'auto' }} />
            <IconButton onClick={onToggle} sx={{ marginLeft: 'auto', color: 'white' }}>
                {open ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
        </Box>
    );
};

export default SidebarHeader;
