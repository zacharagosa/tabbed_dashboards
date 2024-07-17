import React, {
    useCallback,
    useState,
    useEffect,
    createContext,
    useContext, useRef
} from "react";
import { LookerEmbedSDK, LookerEmbedDashboard } from "@looker/embed-sdk"

import styled from "styled-components";

interface DashboardFilterContextValue {
    dashboardFilters: any;
    setDashboardFilters: React.Dispatch<React.SetStateAction<any>>;
}

// Create and export the context for filter sharing
export const DashboardFilterContext =
    createContext<DashboardFilterContextValue>({
        dashboardFilters: null,
        setDashboardFilters: () => {},
    });

const hostUrl = process.env[`LOOKER_HOST_NAME`];
LookerEmbedSDK.init(hostUrl);

interface EmbeddedDashboardProps {
    id: number; // Only number is needed here
    isActive: boolean;
    onConnected: () => void;
    dashboardRef: React.MutableRefObject<(LookerEmbedDashboard | null)[]>;
}

const EmbeddedDashboard = (props: EmbeddedDashboardProps) => {
    const { dashboardFilters, setDashboardFilters } = useContext(DashboardFilterContext);
    const [dashboard, setDashboard] = useState<LookerEmbedDashboard | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const embedCtrRef = useRef<HTMLDivElement | null>(null);
    const { setDashboardFilters: setSharedFilters } = useContext(DashboardFilterContext);
    const dashboardRef = useRef<LookerEmbedDashboard | null>(null); // Ref to store the dashboard instance

    useEffect(() => {
        if (dashboard) {
            dashboard.updateFilters(dashboardFilters);
        }    }, [dashboard, dashboardFilters]);

    useEffect(() => {
        if (embedCtrRef.current) {
            embedCtrRef.current.innerHTML = "";
            LookerEmbedSDK.createDashboardWithId(props.id)
                .appendTo(embedCtrRef.current)
                .withFilters(dashboardFilters) // Use the current dashboardFilters directly
                .on('dashboard:filters:changed', (event) => {
                    setDashboardFilters(event.dashboard.dashboard_filters);
                })
                .build()
                .connect()
                .then((dashboard) => {
                    setDashboard(dashboard);
                    setIsConnected(true);
                    props.dashboardRef.current[props.id] = dashboard;
                    props.onConnected();
                    dashboardRef.current = dashboard;
                })
                .catch((error) => {
                    console.error("Connection error", error);
                });
        }
    }, [props.id]);

    const embedContainerStyle = {
        opacity: props.isActive ? 1 : 0, // Control visibility using opacity
        transition: 'opacity 0.5s ease-in-out' // Add transition for fade-in effect
    };

    return <EmbedContainer  ref={embedCtrRef}
                            className={props.isActive ? 'visible' : ''}>
            </EmbedContainer>;
};

export default EmbeddedDashboard;

// Styled container for the embedded dashboard
export const EmbedContainer = styled.div`
  width: 100%;
  height: 95vh;
  opacity: 0; /* Initially hidden */
  transition: opacity 0.5s ease-in-out;

  & > iframe { /* Style the iframe directly as a child of EmbedContainer */
    width: 100%;
    height: 100%;
  }

  &.visible { /* Apply styles when the .visible class is present */
    opacity: 1;
  }
`;
