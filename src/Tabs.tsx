import React, { useState, useContext } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import EmbeddedDashboard, { DashboardFilterContext } from "./Dashboards";

// Removed: import "react-tabs/style/react-tabs.scss";
import "./Tabs.css"; // Keep for any global/non-component specific styles if needed, or remove if all styling is MUI-based

export const TabbedDashboards = () => {
    const { dashboardFilters, setDashboardFilters } = useContext(DashboardFilterContext);

    // tabConfig population logic (remains the same from previous version)
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

    // Initialize activeTabValue, ensuring tabs array is not empty
    const initialTabValue = tabs.length > 0 ? '0' : ''; // Default to empty if no tabs, though UI should handle this
    const [activeTabValue, setActiveTabValue] = useState<string>(initialTabValue);

    // Environment Variables & Layout
    const tabOrientationEnv = process.env.REACT_APP_TAB_ORIENTATION || 'horizontal';
    const muiTabOrientation: "horizontal" | "vertical" = (tabOrientationEnv === 'vertical-left' || tabOrientationEnv === 'vertical-right') ? 'vertical' : 'horizontal';

    let flexContainerDirection: 'row' | 'row-reverse' | 'column' = 'column'; // Default: Tabs on top (horizontal), content below
    if (muiTabOrientation === 'vertical') { // Simplified logic based on muiTabOrientation
        if (tabOrientationEnv === 'vertical-left') {
            flexContainerDirection = 'row'; // Tabs left, content right
        } else if (tabOrientationEnv === 'vertical-right') {
            flexContainerDirection = 'row-reverse'; // Content left, Tabs right
        }
    }
    
    // Theme class can be applied to the top-level Box if needed, or pass theme object to ThemeProvider
    // For now, assuming Tabs.css might handle some theming based on parent classes if they were kept.
    // const tabTheme = process.env.REACT_APP_TAB_THEME || 'default';
    // const themeClass = `tab-theme-${tabTheme}`; // This class would need to be applied to a top-level Box or similar

    if (tabs.length === 0) {
        return <Box>No tabs configured. Please check your environment variables.</Box>;
    }

    return (
        <DashboardFilterContext.Provider value={{ dashboardFilters, setDashboardFilters }}>
            <Box sx={{ 
                display: 'flex', 
                flexDirection: flexContainerDirection, 
                height: 'calc(100vh - 1px)', // Adjusted height slightly for potential border
                // className: themeClass // If applying legacy theme class via Tabs.css
            }}>
                <TabContext value={activeTabValue}>
                    <Box sx={{
                        borderBottom: muiTabOrientation === 'horizontal' ? 1 : 0,
                        borderRight: muiTabOrientation === 'vertical' && tabOrientationEnv === 'vertical-left' ? 1 : 0,
                        borderLeft: muiTabOrientation === 'vertical' && tabOrientationEnv === 'vertical-right' ? 1 : 0,
                        borderColor: 'divider',
                        order: tabOrientationEnv === 'vertical-right' ? 1 : 0,
                        // Prevent TabList from shrinking when vertical
                        flexShrink: 0,
                    }}>
                        <TabList
                            onChange={(event: React.SyntheticEvent, newValue: string) => setActiveTabValue(newValue)}
                            aria-label="dashboard tabs"
                            orientation={muiTabOrientation}
                            variant="scrollable" // Good default for many tabs
                            scrollButtons="auto"  // Good default for many tabs
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
                                // MUI TabPanel uses 'hidden' attribute for inactive panels, no need for manual visibility
                            }}
                        >
                            <EmbeddedDashboard
                                id={tab.id}
                                isActive={activeTabValue === String(index)} // Correctly pass active state
                            />
                        </TabPanel>
                    ))}
                </TabContext>
            </Box>
        </DashboardFilterContext.Provider>
    );
};
