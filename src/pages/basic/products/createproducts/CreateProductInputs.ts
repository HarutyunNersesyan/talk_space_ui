import { SidebarConfigItem } from '../../../../models/types';

export const sidebarConfig: SidebarConfigItem[] = [
    {
        label: 'Information',
        sections: [
            {
                header: 'New Product',
                fields: [
                    { name: 'isActive', label: 'Active', type: 'checkbox' },
                    { name: 'featured', label: 'Featured', type: 'checkbox' },
                    { name: 'name', label: 'Name', required:true },
                    { name: 'sku', label: 'Sku' },
                    { name: 'showSku', label: 'showSku', type: 'checkbox' },
                    { name: 'categories', label: 'Categories', type: 'array',required:true },
                    { name: 'sortIndex', label: 'Sort Index', type: 'number' },
                    { name: 'description', label: 'Description', type: 'description' },
                    { name: 'shortDescription', label: 'Short Description', type: 'description' },
                ],
            },
        ],
    },
    {
        label: 'Dimensions',
        sections: [
            {
                header: 'New Product',
                fields: [
                    { name: 'weight', label: 'Weight', type:'number' },
                    { name: 'length', label: 'Length', type:'number' },
                    { name: 'width', label: 'Width', type:'number' },
                    { name: 'height', label: 'Height', type:'number' },
                ],
            },
        ],
    },
    {
        label: 'Sales',
        sections: [
            {
                header: 'New Product',
                fields: [
                    { name: 'cost', label: 'Cost', type:'number',required:true },
                    { name: 'retailPrice', label: 'Price', type:'number',required:true },
                    { name: 'showRetailPrice', label: 'Show Price', type: 'checkbox'},
                    { name: 'salePrice', label: 'Sale Price', type:'number', },
                    { name: 'showSalePrice', label: 'Show Sale Price',type: 'checkbox' },
                    { name: 'disallowCc', label: 'Disallow Credit Card purchase', type: 'checkbox',}
                ],
            },
        ],
    },
    {
        label: 'Search Engine',
        sections: [
            {
                header: 'New Product',
                fields: [
                    { name: 'url', label: 'URL' },
                    { name: 'title', label: 'Title' },
                ],
            },
        ],
    },
    {
        label: 'Inventory',
        sections: [
            {
                header: 'New Product',
                fields: [
                    { name: 'inventory', label: 'Inventory Location' },
                    { name: 'qty', label: 'Quantity', type:'number' },
                    { name: 'inStock', label: 'In Stock', type:'checkbox' },

                ],
            },
        ],
    },
    {
        label: 'Media',
        sections: [
            {
                header: 'New Product',
                fields: [
                    { name: 'productVideo', label: 'Product Video' },
                    { name: 'productImagesUrl', label: 'Product Images', type:'image' },
                ],
            },
        ],
    },
];