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

    useEffect(() => {
        if (embedCtrRef.current) {
            const dashboard = LookerEmbedSDK.createDashboardWithId(id)
                .appendTo(embedCtrRef.current)
                .on("dashboard:filters:changed", (event) => {
                    setSharedFilters(event.dashboard.dashboard_filters);
                })
                .build();

            dashboard.connect()
                .then(() => {
                    setLocalDashboard(dashboard);
                })
                .catch((error) => {
                    console.error("Connection error", error);
                });
            
            return () => {
                // Attempt to find a more specific cleanup method if available
                // For now, using disconnect as a general cleanup.
                // SDK documentation should be checked for the best practice on dashboard disposal.
                if (localDashboard && typeof (localDashboard as any).close === 'function') {
                    (localDashboard as any).close().catch((e: any) => console.error("Error closing dashboard:", e));
                } else if (localDashboard && typeof localDashboard.disconnect === 'function') {
                     localDashboard.disconnect().catch((e: any) => console.error("Error disconnecting dashboard:", e));
                }
                setLocalDashboard(null);
            };
        }
    }, [id, setSharedFilters]); // Added setSharedFilters to dependencies

    useEffect(() => {
        if (isActive && localDashboard && dashboardFilters) {
            // Consider adding a deep comparison here if dashboardFilters can be complex
            // and to avoid unnecessary updates if the filters haven't actually changed.
            localDashboard.updateFilters(dashboardFilters);
        }
    }, [dashboardFilters, isActive, localDashboard]);

    return <EmbedContainer ref={embedCtrRef} isActive={isActive} />;
};

export default EmbeddedDashboard;

// Styled container for the embedded dashboard
export const EmbedContainer = styled.div<{ isActive?: boolean }>`
  width: 100%;
  height: 95vh;
  opacity: ${({ isActive }) => (isActive ? 1 : 0)};
  transition: opacity 0.5s ease-in-out;
  pointer-events: ${({ isActive }) => (isActive ? 'auto' : 'none')}; /* Prevent interaction with hidden dashboards */

  & > iframe {
    width: 100%;
    height: 100%;
    border: none; /* Remove default iframe border */
  }
`;
