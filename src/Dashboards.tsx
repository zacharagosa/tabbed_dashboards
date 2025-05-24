import React, {
    createContext,
    useContext,
    useRef,
    useEffect,
    useState
} from "react";
import { LookerEmbedSDK, LookerEmbedDashboard } from "@looker/embed-sdk";
import styled from "styled-components";

interface DashboardFilterContextValue {
    dashboardFilters: any;
    setDashboardFilters: React.Dispatch<React.SetStateAction<any>>;
}

export const DashboardFilterContext =
    createContext<DashboardFilterContextValue>({
        dashboardFilters: {},
        setDashboardFilters: () => {},
    });

const hostUrl = process.env.LOOKER_HOST_NAME
LookerEmbedSDK.init(hostUrl);

interface EmbeddedDashboardProps {
    id: number;
    isActive: boolean;
}

const EmbeddedDashboard: React.FC<EmbeddedDashboardProps> = ({ id, isActive }) => {
    const { dashboardFilters, setDashboardFilters: setSharedFilters } = useContext(DashboardFilterContext);
    const embedCtrRef = useRef<HTMLDivElement | null>(null);
    const [localDashboard, setLocalDashboard] = useState<LookerEmbedDashboard | null>(null);
    const isActiveRef = useRef(isActive);
    const currentDashboardFiltersRef = useRef(dashboardFilters); // Ref for current context filters

    useEffect(() => {
        isActiveRef.current = isActive;
    }, [isActive]);

    useEffect(() => {
        currentDashboardFiltersRef.current = dashboardFilters;
    }, [dashboardFilters]);

    useEffect(() => {
        // Ensure id is present; though as a prop, it should always be.
        if (embedCtrRef.current && id) { 
            let dashboardBuilder = LookerEmbedSDK.createDashboardWithId(id)
                .appendTo(embedCtrRef.current)
                .on('dashboard:filters:changed', (event) => {
                    if (isActiveRef.current) {
                        const newEventFilters = event.dashboard.dashboard_filters || {};
                            setSharedFilters(newEventFilters);
                    }
                });

            // Apply filters from context if they exist and are not empty
            if (dashboardFilters && Object.keys(dashboardFilters).length > 0) {
                dashboardBuilder = dashboardBuilder.withFilters(dashboardFilters);
            }

            const client = dashboardBuilder.build();

            client.connect() // This connect() method returns Promise<LookerEmbedDashboard>
                .then(connectedDashboard => { // 'connectedDashboard' is the resolved LookerEmbedDashboard instance
                    setLocalDashboard(connectedDashboard); // Use THIS resolved instance
                })
                .catch((error: Error) => { // Explicitly type error
                    console.error(`Looker SDK Error: Dashboard with ID ${id} connection failed.`, error);
                });
            
            return () => {
                if (localDashboard && typeof localDashboard.stop() === 'function') {
                    try {
                        localDashboard.stop();
                    } catch (e) {
                        // Log any error during close, though it's mostly best-effort
                        console.error("Error during dashboard close:", e);
                    }
                }
                setLocalDashboard(null); // Reset the state
            };
        }
    }, [id, setSharedFilters]);

    useEffect(() => {
        if (isActive && localDashboard && dashboardFilters) {
                 localDashboard.updateFilters(dashboardFilters);
        } else if (isActive && localDashboard && (!dashboardFilters || Object.keys(dashboardFilters).length === 0)) {
                localDashboard.updateFilters({});

        }
    }, [isActive, localDashboard, JSON.stringify(dashboardFilters)]);

    return <EmbedContainer ref={embedCtrRef} isActive={isActive} />;
};

export default EmbeddedDashboard;

// Styled container for the embedded dashboard
export const EmbedContainer = styled.div<{ isActive?: boolean }>`
  width: 100%;
  height: 100%; /* Changed from 95vh to fill TabPanel better */
  display: ${props => props.isActive ? 'flex' : 'none'}; /* Use flex to allow iframe to fill */
  flex-direction: column; /* Ensure iframe content flows correctly */
  
  & > iframe {
    flex-grow: 1; /* Allow iframe to take available space */
    border: none; /* Remove default iframe border */
    width: 100%;
    height: 100%;
  }
`;
