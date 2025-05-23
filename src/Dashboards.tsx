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
        dashboardFilters: null,
        setDashboardFilters: () => {},
    });

const hostUrl = process.env.LOOKER_HOST_NAME || "https://cscales.cloud.looker.com/"; // Fallback URL
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
                    // Inside the .on('dashboard:filters:changed', (event) => { ... }) callback,
                    // within the main dashboard creation useEffect:

                    if (isActiveRef.current) {
                        const newEventFilters = event.dashboard.dashboard_filters || {}; // Default to empty object if event filters are null/undefined
                        
                        // currentDashboardFiltersRef.current could be null (initial state) or an object.
                        // If currentDashboardFiltersRef.current is null and newEventFilters is {}, stringify will match "{}".
                        // If currentDashboardFiltersRef.current is {} and newEventFilters is {}, stringify will match.
                        // This comparison correctly handles transitions to/from empty/null states.
                        if (JSON.stringify(newEventFilters) !== JSON.stringify(currentDashboardFiltersRef.current)) {
                            setSharedFilters(newEventFilters);
                        }
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
    }, [id, setSharedFilters]); // Added setSharedFilters to dependencies

    useEffect(() => {
        if (isActive && localDashboard && dashboardFilters) {
            // Basic check to prevent redundant updates if filters are already in sync
            // Note: localDashboard.options?.filters might not be available or accurate for all SDK versions/setups.
            // Consider this a best-effort optimization.
            if (JSON.stringify(localDashboard.options?.filters) !== JSON.stringify(dashboardFilters)) {
                 localDashboard.updateFilters(dashboardFilters);
            }
        } else if (isActive && localDashboard && (!dashboardFilters || Object.keys(dashboardFilters).length === 0)) {
            // If context clears filters (dashboardFilters is null or empty), and this tab is active, clear its filters too.
            // Check if local dashboard actually has filters before clearing to avoid redundant calls.
            if (localDashboard.options?.filters && Object.keys(localDashboard.options.filters).length > 0) {
                localDashboard.updateFilters({});
            }
        }
    }, [isActive, localDashboard, JSON.stringify(dashboardFilters)]); // Use stringified filters for dependency

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
