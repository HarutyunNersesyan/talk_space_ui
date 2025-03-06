import React, { useState, ReactNode } from 'react';
import { Box, ListItem, ListItemText, IconButton, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ArrowRight';
import ExpandLessIcon from '@mui/icons-material/ArrowDropDown';

interface CollapsibleMenuSectionProps {
    title: string;
    children: ReactNode;
}

const CollapsibleMenuSection: React.FC<CollapsibleMenuSectionProps> = ({ title, children }) => {
    const [open, setOpen] = useState(false);

    const handleToggle = () => {
        setOpen(!open);
    };

    return (
        <>
            <ListItem button onClick={handleToggle} className = "menu-item">
                <ListItemText primary={title} />
                <IconButton size="small" sx={{color: "white"}}>
                    {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </ListItem>
            <Collapse in={open}>
                <Box pl={2}>{children}</Box>
            </Collapse>
        </>
    );
};

export default CollapsibleMenuSection;
