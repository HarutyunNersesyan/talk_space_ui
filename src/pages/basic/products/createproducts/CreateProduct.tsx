import React from 'react';
import LayoutWithSidebar from "../../../../components/forms/LayoutWithSidebar";
import { sidebarConfig } from './CreateProductInputs';

const CreateProduct: React.FC = () => {
    return <LayoutWithSidebar sidebarConfig={sidebarConfig} updateType={'product'} mode={'create'}/>;
};

export default CreateProduct;