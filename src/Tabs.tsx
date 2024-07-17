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

    const [tabState, setTabState] = useState<TabState>({
        activeTab: 0,
        connected: { 0: false, 1: false, 2: false },
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

        <DashboardFilterContext.Provider
            value={{ dashboardFilters, setDashboardFilters }}
        >
            <Tabs selectedIndex={tabState.activeTab} onSelect={(index) =>setTabState(prev => ({ ...prev, activeTab: index }))}  >
                <TabList className="my-tab-list">
                    <Tab>Customer Behavior</Tab>
                    <Tab>Customer Data</Tab>
                    <Tab>Customer Profile</Tab>
                </TabList>

                <TabPanel>
                    <EmbeddedDashboard
                            id={11}
                            onConnected={() => handleConnected(0)} // No need to pass dashboard instance
                            dashboardRef={dashboardRefs} // Pass dashboardRefs to EmbeddedDashboard
                            isActive={tabState.activeTab === 0} // Add the isActive prop

                    /> {/* Pass active state */}
                    </TabPanel>
                        <TabPanel>
                        <EmbeddedDashboard
                            id={6}
                            onConnected={() => handleConnected(1)} // No need to pass dashboard instance
                            dashboardRef={dashboardRefs} // Pass dashboardRefs to EmbeddedDashboard
                            isActive={tabState.activeTab === 1} // Add the isActive prop

                        />
                        </TabPanel>
                    <TabPanel>
                            <EmbeddedDashboard
                            id={1}
                            onConnected={() => handleConnected(2)} // No need to pass dashboard instance
                            dashboardRef={dashboardRefs} // Pass dashboardRefs to EmbeddedDashboard
                            isActive={tabState.activeTab === 2} // Add the isActive prop

                            />
                    </TabPanel>
            </Tabs>
         </DashboardFilterContext.Provider>
    );
};
