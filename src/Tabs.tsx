import * as React from 'react';
import  { useState, useCallback, useRef, useEffect} from "react";

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.scss"; // Import the Sass file
import "./Tabs.css"; // Import your custom styles afterward


import EmbeddedDashboard from "./Dashboards";
import { DashboardFilterContext } from "./Dashboards"; // Import the context
import { LookerEmbedDashboard, LookerEmbedSDK } from "@looker/embed-sdk"; // Import LookerEmbedDashboard


export const TabbedDashboards = () => {
    // Create the shared state for the filters
    const [dashboardFilters, setDashboardFilters] = useState(null);
    const [hasLoadedTabs, setHasLoadedTabs] = useState(false);
    const [dashboardInstances, setDashboardInstances] = useState<(LookerEmbedDashboard | null)[]>([]);


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

    useEffect(() => {
        // ... existing logic to populate tabConfig ...
        setHasLoadedTabs(true); // Set hasLoadedTabs to true once loading is done
    }, []); // Empty dependency array ensures this runs only once


    const tabConfig: { name: string; id: number }[] = [];

    let i = 1;
    while (process.env[`REACT_APP_TAB_${i}_NAME`] && process.env[`REACT_APP_TAB_${i}_ID`]) {
        tabConfig.push({
            name: process.env[`REACT_APP_TAB_${i}_NAME`],
            id: Number(process.env[`REACT_APP_TAB_${i}_ID`]),
        });
        i++;
        console.log(tabConfig)
    }

    const defaultTabConfig = [
        { name: "Customer Behavior", id: 1 },
        { name: "Customer Data", id: 2 },
        { name: "Customer Profile", id: 3 },
    ];


    const tabs = tabConfig.length > 0 ? tabConfig : defaultTabConfig;
    const dashboardRefs = useRef(dashboardInstances);

    const [tabState, setTabState] = useState({
        activeTab: 0,
        connected: Array(tabs.length).fill(false),
    });

    const embedContainerRefs = useRef<(HTMLDivElement | null)[]>(
        Array(tabs.length).fill(null)
    );


    useEffect(() => {
        // Ensure all dashboards have loaded before applying filters
        if (Object.values(tabState.connected).every(Boolean)) {
            handleTabClick(tabState.activeTab);
        }
    }, [tabState.connected, dashboardFilters,tabState.activeTab]); // This useEffect will run whenever tabState.connected changes

    useEffect(() => {
        if (hasLoadedTabs && tabs.length > 0) {
            Promise.all(
                tabs.map(async (tab, index) => {
                    const embedContainer = document.createElement("div");
                    embedContainerRefs.current[index] = embedContainer;

                    const dashboard = await LookerEmbedSDK.createDashboardWithId(tab.id)
                        .appendTo(embedContainer)
                        .withFilters(dashboardFilters)
                        .on("dashboard:filters:changed", (event) => {
                            setDashboardFilters(event.dashboard.dashboard_filters);
                        })
                        .build()
                        .connect();

                    return {index, dashboard}; // Return both index and dashboard
                })
            ).then(results => {
                const newInstances = Array(tabs.length).fill(null) as (LookerEmbedDashboard | null)[]; // Initialize with nulls
                results.forEach(({index, dashboard}) => {
                    newInstances[index] = dashboard;
                });
                setDashboardInstances(newInstances);
            });
        }
    }, [hasLoadedTabs, tabs]);



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
        }, 1000);
    };


    const handleConnected = useCallback(
        (tabId: number, dashboard: LookerEmbedDashboard) => {
            setTabState((prev) => ({ ...prev, connected: { ...prev.connected, [tabId]: true } }));
            setDashboardInstances(prevInstances => {
                const newInstances = [...prevInstances];
                newInstances[tabId] = dashboard;
                return newInstances;
            });
        },
        [dashboardFilters]
    );

    return (

        <DashboardFilterContext.Provider
            value={{ dashboardFilters, setDashboardFilters }}
        >
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
                            dashboardRef={embedContainerRefs}
                            isActive={tabState.activeTab === index}
                            index={index}
                        />
                    </TabPanel>
                ))}
            </Tabs>
        </DashboardFilterContext.Provider>
    );
};
