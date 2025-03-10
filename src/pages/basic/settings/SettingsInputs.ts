import { SidebarConfigItem } from '../../../models/types';

export const sidebarConfig: SidebarConfigItem[] = [
    {
        label: 'Settings',
        sections: [
            {
                header: 'General Information',
                fields: [
                    { name: 'name', label: 'Store Name',required:true },
                    { name: 'slogan', label: 'Slogan' },
                    { name: 'description', label: 'Description' }
                ],
            },
            {
                header: 'Contact Information',
                fields: [
                    { name: 'businessPrimaryPhone', label: 'Primary Phone',required:true },
                    { name: 'businessSecondaryPhone', label: 'Secondary Phone' },
                    { name: 'businessPrimaryEmailId', label: 'Primary Email',required:true },
                    { name: 'businessSecondaryEmailId', label: 'Secondary Email' },
                ],
            },
            {
                header: 'Email Settings',
                fields: [
                    { name: 'bcc', label: 'Bcc', path: 'emailConf.bcc', type:'image'},
                ],
            },
            {
                header: 'Location',
                fields: [
                    { name: 'address', label: 'Address' },
                    { name: 'zipcode', label: 'Zipcode' },
                    { name: 'city', label: 'City' },
                    { name: 'state', label: 'State' },
                ],
            },
            {
                header: 'Upload Logos',
                fields: [
                    { name: 'logoUrl', label: 'WebSite Logo', path: "logoUrl.company", type: 'image' },
                    { name: 'emailLogo', label: 'Email logo', path: "emailConf.logoURL", type: 'image' },
                ],
            },
        ],
    },
    // {
    //     label: 'Order Settings',
    //     sections: [
    //         {
    //             header: 'Minimum Order Amount',
    //             fields: [
    //                 { name: 'minOrderAmount', label: 'Amount' },
    //             ],
    //         },
    //     ],
    // },
    // {
    //     label: 'Fulfillment Center',
    //     sections: [
    //         {
    //             header: 'Location',
    //             fields: [
    //                 { name: 'address', label: 'Address' },
    //                 { name: 'zipcode', label: 'Zipcode' },
    //                 { name: 'city', label: 'City' },
    //                 { name: 'state', label: 'State' },
    //                 { name: 'invoiceLogo', label: 'Invoice Logo', path: "logoUrl.invoice", type: 'image' },
    //             ],
    //         },
    //     ],
    // },
    // {
    //     label: 'Payment',
    //     sections: [
    //         {
    //             header: 'Payments',
    //             fields: [
    //                 { name: '', label: '?' },
    //                 { name: '', label: '?' },
    //                 { name: '', label: '?' },
    //             ],
    //         },
    //     ],
    // },
    // {
    //     label: 'Service Area',
    //     sections: [
    //         {
    //             header: 'Location',
    //             fields: [
    //                 { name: '', label: 'Default Country' },
    //                 { name: '', label: 'Other Countries' },
    //             ],
    //         },
    //     ],
    // },
    // {
    //     label: 'Shipping Method',
    //     sections: [
    //         {
    //             header: 'Shipping Method',
    //             fields: [
    //                 { name: '', label: '?' },
    //                 { name: '', label: '?' },
    //                 { name: '', label: '?' },
    //             ],
    //         },
    //     ],
    // },
    // {
    //     label: 'Social Media',
    //     sections: [
    //         {
    //             header: 'Configuration',
    //             fields: [
    //                 { name: 'facebook', label: 'Facebook' },
    //                 { name: 'instagram', label: 'Instagram' },
    //                 { name: 'twitter', label: 'Twitter' },
    //                 { name: 'websiteUrl', label: 'Website Url' },
    //             ],
    //         },
    //     ],
    // },
];