import * as React from 'react';
import  { useState } from "react"; // Removed useCallback, useRef, useEffect

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.scss"; // Import the Sass file
import "./Tabs.css"; // Import your custom styles afterward

import EmbeddedDashboard from "./Dashboards";
import { DashboardFilterContext } from "./Dashboards"; // Import the context
// LookerEmbedDashboard and LookerEmbedSDK import removed


export const TabbedDashboards = () => {
    // Create the shared state for the filters
    const [dashboardFilters, setDashboardFilters] = useState(null);
    // Removed hasLoadedTabs and dashboardInstances states

    interface TabState {
        activeTab: number;
        // Removed 'connected' property
    }

    // tabConfig population logic remains the same
    const tabConfig: { name: string; id: number }[] = [];
    let i = 1;
    // Ensure process.env is accessed safely, especially in environments where it might not be fully defined (e.g. test runners)
    const reactAppTabName = (idx: number) => process.env[`REACT_APP_TAB_${idx}_NAME`];
    const reactAppTabId = (idx: number) => process.env[`REACT_APP_TAB_${idx}_ID`];

    while (reactAppTabName(i) && reactAppTabId(i)) {
        tabConfig.push({
            name: reactAppTabName(i) as string, // Added type assertion
            id: Number(reactAppTabId(i)),
        });
        i++;
        // console.log(tabConfig) // Keep for debugging if necessary, but generally remove for production
    }

    const defaultTabConfig = [
        { name: "Customer Behavior", id: 1 }, // Ensure these IDs are valid Looker Dashboard IDs
        { name: "Customer Data", id: 2 },
        { name: "Customer Profile", id: 3 },
    ];

    const tabs = tabConfig.length > 0 ? tabConfig : defaultTabConfig;
    // Removed dashboardRefs and embedContainerRefs

    const [tabState, setTabState] = useState<TabState>({ // Added type to useState
        activeTab: 0,
        // Removed 'connected' initialization
    });

    // Removed useEffect for pre-creating dashboards
    // Removed useEffect that called handleTabClick based on tabState.connected

    const handleTabClick = (tabIndex: number) => { // Renamed tabId to tabIndex for clarity with onSelect
        setTabState((prev) => ({ ...prev, activeTab: tabIndex }));
        // Removed filter update logic from here
    };

    // Removed handleConnected function

    return (
        <DashboardFilterContext.Provider
            value={{ dashboardFilters, setDashboardFilters }}
        >
            <Tabs
                selectedIndex={tabState.activeTab}
                onSelect={handleTabClick} // Directly use handleTabClick, it now matches the expected signature
            >
                <TabList className="my-tab-list">
                    {tabs.map((tab, index) => (
                        <Tab key={index}>{tab.name}</Tab>
                    ))}
                </TabList>

                {tabs.map((tab, index) => (
                    <TabPanel key={index}>
                        <EmbeddedDashboard
                            id={tab.id} // Pass the dashboard ID
                            isActive={tabState.activeTab === index}
                            // Removed dashboardRef and index props
                        />
                    </TabPanel>
                ))}
            </Tabs>
        </DashboardFilterContext.Provider>
    );
};
