import React, { useState, /* Removed useContext here */ } from 'react'; // Make sure to import useState
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
// Import the context itself, not the component
import EmbeddedDashboard, { DashboardFilterContext } from "./Dashboards";

import "./Tabs.css";

export const TabbedDashboards = () => {
    // Step 1: Define the state for dashboardFilters here using useState
    const [currentSharedFilters, setCurrentSharedFilters] = useState({});

    // tabConfig population logic (remains the same)
    const tabConfig: { name: string; id: number }[] = [];
    let i = 1;
    const reactAppTabName = (idx: number) => process.env[`REACT_APP_TAB_${idx}_NAME`];
    const reactAppTabId = (idx: number) => process.env[`REACT_APP_TAB_${idx}_ID`];

    while (reactAppTabName(i) && reactAppTabId(i)) {
        tabConfig.push({
            name: reactAppTabName(i) as string,
            id: Number(reactAppTabId(i)),
        });
        i++;
    }

    const defaultTabConfig = [
        { name: "Customer Behavior", id: 1 },
        { name: "Customer Data", id: 2 },
        { name: "Customer Profile", id: 3 },
    ];

    const tabs = tabConfig.length > 0 ? tabConfig : defaultTabConfig;
    const initialTabValue = tabs.length > 0 ? '0' : '';
    const [activeTabValue, setActiveTabValue] = useState<string>(initialTabValue);

    const tabOrientationEnv = process.env.REACT_APP_TAB_ORIENTATION || 'horizontal';
    const muiTabOrientation: "horizontal" | "vertical" = (tabOrientationEnv === 'vertical-left' || tabOrientationEnv === 'vertical-right') ? 'vertical' : 'horizontal';

    let flexContainerDirection: 'row' | 'row-reverse' | 'column' = 'column';
    if (muiTabOrientation === 'vertical') {
        if (tabOrientationEnv === 'vertical-left') {
            flexContainerDirection = 'row';
        } else if (tabOrientationEnv === 'vertical-right') {
            flexContainerDirection = 'row-reverse';
        }
    }

    if (tabs.length === 0) {
        return <Box>No tabs configured. Please check your environment variables.</Box>;
    }

    // Step 2: Use the state and setter from useState in the Provider's value
    return (
        <DashboardFilterContext.Provider
            value={{
                dashboardFilters: currentSharedFilters,
                setDashboardFilters: setCurrentSharedFilters
            }}
        >

            <Box sx={{
                display: 'flex',
                flexDirection: flexContainerDirection,
                height: `calc(100vh - 1px )`,
            }}>
                <TabContext value={activeTabValue}>
                    <Box sx={{
                        borderBottom: muiTabOrientation === 'horizontal' ? 1 : 0,
                        borderRight: muiTabOrientation === 'vertical' && tabOrientationEnv === 'vertical-left' ? 1 : 0,
                        borderLeft: muiTabOrientation === 'vertical' && tabOrientationEnv === 'vertical-right' ? 1 : 0,
                        borderColor: 'divider',
                        order: tabOrientationEnv === 'vertical-right' ? 1 : 0,
                        flexShrink: 0,
                    }}>
                        <TabList
                            onChange={(event: React.SyntheticEvent, newValue: string) => setActiveTabValue(newValue)}
                            aria-label="dashboard tabs"
                            orientation={muiTabOrientation}
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            {tabs.map((tab, index) => (
                                <Tab label={tab.name} value={String(index)} key={index} />
                            ))}
                        </TabList>
                    </Box>
                    {tabs.map((tab, index) => (
                        <TabPanel
                            value={String(index)}
                            key={index}
                            sx={{
                                padding: 0,
                                flexGrow: 1,
                                overflow: 'auto',
                            }}
                        >
                            {/* EmbeddedDashboard will now receive the correct context values */}
                            <EmbeddedDashboard
                                id={tab.id}
                                isActive={activeTabValue === String(index)}
                            />
                        </TabPanel>
                    ))}
                </TabContext>
            </Box>
        </DashboardFilterContext.Provider>
    );
};
