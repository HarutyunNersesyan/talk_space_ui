import React from 'react';
import LayoutWithSidebar from "../../../components/forms/LayoutWithSidebar";
import { sidebarConfig } from './SettingsInputs';

const Settings: React.FC = () => {
    return <LayoutWithSidebar sidebarConfig={sidebarConfig} updateType={'store'} mode={'update'}/>;
};

export default Settings;