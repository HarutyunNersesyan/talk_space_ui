import React, { useCallback, useEffect, useState } from 'react';
import SectionContent from "./SectionContent";
import UpdateButton from "../button/UpdateButton";
import CreateButton from "../button/CreateButton";
import { Section, SidebarConfigItem, UpdateType } from "../../models/types";
import SectionHeader from "../../pages/basic/settings/SectionHeader";
import DataFetcher from "../../pages/basic/settings/DataFetcher";
import SideMenu from "../../pages/basic/settings/SideMenu";

interface LayoutWithSidebarProps {
    sidebarConfig: SidebarConfigItem[];
    updateType: UpdateType;
    mode: 'create' | 'update';
}

interface DataResponse {
    [key: string]: any;
}

const LayoutWithSidebar: React.FC<LayoutWithSidebarProps> = ({ sidebarConfig, updateType, mode }) => {
    const [data, setData] = useState<DataResponse | null>(mode === 'update' ? null : {});
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [storeId, setStoreId] = useState<number | null>(null);

    useEffect(() => {
        if (mode === 'create') {
            setData({});
        }
    }, [mode]);

    const handleDataFetched = useCallback((fetchedData: DataResponse) => {
        if (mode === 'update') {
            setData(fetchedData);
            setStoreId(fetchedData.id || null);
        }
    }, [mode]);

    const handleSidebarClick = (index: number) => {
        if (activeIndex !== index) {
            setActiveIndex(index);
        }
    };

    const handleInputChange = (
        name: string,
        value: string | number | boolean | string[] | number[] | null,
        path?: string
    ) => {
        setData((prevData) => {
            if (!prevData) return null;

            if (path) {
                const keys = path.split('.');
                let updatedData = { ...prevData };
                let currentLevel = updatedData;

                keys.forEach((key, index) => {
                    if (index === keys.length - 1) {
                        currentLevel[key] = value;
                    } else {
                        if (Array.isArray(currentLevel[key])) {
                            currentLevel[key] = [...currentLevel[key]];
                        } else if (typeof currentLevel[key] === 'object' && currentLevel[key] !== null) {
                            currentLevel[key] = { ...currentLevel[key] };
                        } else {
                            currentLevel[key] = {};
                        }
                        currentLevel = currentLevel[key];
                    }
                });

                return updatedData;
            } else {
                return { ...prevData, [name]: value };
            }
        });
    };

    const actionUrl = (() => {
        switch (updateType) {
            case 'store':
                return mode === 'create'
                    ? `${process.env.REACT_APP_API_URL}/api/private/store/save`
                    : `${process.env.REACT_APP_API_URL}/api/private/store/update`;
            case 'product':
                return mode === 'create'
                    ? `${process.env.REACT_APP_API_URL}/api/private/product/save`
                    : `${process.env.REACT_APP_API_URL}/api/private/product/update`;
            default:
                return '';
        }
    })();

    const areRequiredFieldsFilled = useCallback((data: DataResponse, configItems: SidebarConfigItem[]) => {
        return configItems.every(item =>
            item.sections.every(section =>
                section.fields.every(field =>
                    !field.required || (data[field.name] && data[field.name].toString().trim() !== '')
                )
            )
        );
    }, []);

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif', backgroundColor: '#f3f4f6' }}>
            <SideMenu config={sidebarConfig} activeIndex={activeIndex} onItemClick={handleSidebarClick} />
            <div
                style={{
                    marginLeft: '270px',
                    flex: 1,
                    padding: '2rem',
                    backgroundColor: '#f9fafb',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                }}
            >
                <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', flex: 1 }}>
                    {mode === 'update' && <DataFetcher onDataFetched={handleDataFetched} />}
                    {activeIndex !== null && data && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <SectionHeader label={sidebarConfig[activeIndex].label} />
                            <div style={{ marginTop: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                {mode === 'create' ? (
                                    <CreateButton
                                        url={actionUrl}
                                        data={data}
                                        disabled={!areRequiredFieldsFilled(data, sidebarConfig)}
                                    />
                                ) : (
                                    storeId && data && (
                                        <UpdateButton
                                            url={actionUrl}
                                            data={{ ...data, id: storeId }}
                                            disabled={!areRequiredFieldsFilled(data, sidebarConfig)}
                                        />
                                    )
                                )}
                            </div>
                            <SectionContent
                                sections={sidebarConfig[activeIndex].sections}
                                data={data}
                                onInputChange={handleInputChange}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LayoutWithSidebar;
