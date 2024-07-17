import * as React from 'react';
import  { useState, useCallback, useRef, useEffect} from "react";

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.scss"; // Import the Sass file
import "./Tabs.css"; // Import your custom styles afterward


import EmbeddedDashboard from "./Dashboards";
import { DashboardFilterContext } from "./Dashboards"; // Import the context
import { LookerEmbedDashboard } from "@looker/embed-sdk"; // Import LookerEmbedDashboard


export const TabbedDashboards = () => {
    // Create the shared state for the filters
    const [dashboardFilters, setDashboardFilters] = useState(null);
    interface TabState {
        activeTab: number;
        connected: { [key: number]: boolean }; // Allow string or number keys
    }

    const getEnvVar = (name: string) => {
        if (typeof window !== 'undefined' && window.process && window.process.env) {
            return window.process.env[name];
        } else {
            return null;
        }
    };

    // Dynamically fetch tabs from environment variables (with fallback)
    const tabConfig: { name: string; id: number }[] = [];

    let i = 1;
    while (process.env[`REACT_APP_TAB_${i}_NAME`] && process.env[`REACT_APP_TAB_${i}_ID`]) {
        tabConfig.push({
            name: process.env[`REACT_APP_TAB_${i}_NAME`],
            id: Number(process.env[`REACT_APP_TAB_${i}_ID`]),
        });
        i++;
    }


// Define a default tab configuration in case env vars are not available
    const defaultTabConfig = [
        { name: "Customer Behavior", id: 1 },
        { name: "Customer Data", id: 2 },
        { name: "Customer Profile", id: 3 },
    ];

    // If no tabs are found in the environment, use the default configuration
    const tabs = tabConfig.length > 0 ? tabConfig : defaultTabConfig;

    const [tabState, setTabState] = useState({
        activeTab: 0,
        connected: Array(tabs.length).fill(false),
    });

    const setDashboardInstance = useCallback((index: number, dashboard: LookerEmbedDashboard) => {
        dashboardRefs.current = dashboardRefs.current.map((d, i) => (i === index ? dashboard : d));
    }, []);

    const dashboardRefs = useRef<(LookerEmbedDashboard | null)[]>([]); // Array to store dashboard instances

    useEffect(() => {
        // Ensure all dashboards have loaded before applying filters
        if (Object.values(tabState.connected).every(Boolean)) {
            handleTabClick(tabState.activeTab);
        }
    }, [tabState.connected, dashboardFilters,tabState.activeTab]); // This useEffect will run whenever tabState.connected changes

    const handleTabClick = async (tabId: number) => {
        setTabState((prev) => ({ ...prev, activeTab: tabId }));

        setTimeout(() => {
            for (let index = 0; index < dashboardRefs.current.length; index++) {
                const dashboard = dashboardRefs.current[index];
                if (dashboard && index !== tabId) {
                    try {
                        dashboard.updateFilters(dashboardFilters);
                    } catch (error) {
                        console.error(`Error updating filters for dashboard ${index + 1}:`, error);
                    }
                }
            }
        }, 1000); // Adjust timeout as needed
    };


    const handleConnected = useCallback(
        (tabId: number) => {
            setTabState((prev) => ({ ...prev, connected: { ...prev.connected, [tabId]: true } }));
            console.log("Initial filters applied to dashboard", tabId);
        },
        [dashboardFilters]
    );

    return (

        <DashboardFilterContext.Provider value={{ dashboardFilters, setDashboardFilters }}>
            <Tabs
                selectedIndex={tabState.activeTab}
                onSelect={(index) =>
                    setTabState((prev) => ({ ...prev, activeTab: index }))
                }
            >
                <TabList className="my-tab-list">
                    {tabs.map((tab, index) => (
                        <Tab key={index}>{tab.name}</Tab>
                    ))}
                </TabList>

                {tabs.map((tab, index) => (
                    <TabPanel key={index}>
                        <EmbeddedDashboard
                            id={tab.id}
                            onConnected={() => handleConnected(index)}
                            dashboardRef={dashboardRefs}
                            isActive={tabState.activeTab === index}
                        />
                    </TabPanel>
                ))}
            </Tabs>
        </DashboardFilterContext.Provider>
    );
};
