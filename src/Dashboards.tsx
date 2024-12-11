import React, {
    createContext,
    useContext, useRef, useEffect,
    forwardRef
} from "react";
import { LookerEmbedSDK, LookerEmbedDashboard } from "@looker/embed-sdk"
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

const hostUrl = process.env[`LOOKER_HOST_NAME`];
LookerEmbedSDK.init(hostUrl);
interface EmbeddedDashboardProps {
    id: number; // Only number is needed here
    isActive: boolean;
    onConnected: () => void;
    dashboardRef: React.MutableRefObject<(HTMLDivElement | null)[]>;
}
const EmbeddedDashboard = forwardRef<HTMLDivElement, {
    dashboardRef: React.MutableRefObject<(HTMLDivElement | null)[]>;
    isActive: boolean;
    index: number;
}>((props, ref) => {
    const embedCtrRef = useRef<HTMLDivElement | null>(null);
    const { setDashboardFilters: setSharedFilters } = useContext(DashboardFilterContext);
    const embedContainerStyle = {
        opacity: props.isActive ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out'
    };
    useEffect(()=>{
        if(props.dashboardRef.current[props.index] && !embedCtrRef.current){
            props.dashboardRef.current[props.index] = embedCtrRef.current;
        }
    },[embedCtrRef.current])
    return (
        <EmbedContainer
            ref={ref} // Directly pass the ref
            className={props.isActive ? "visible" : ""}
            style={embedContainerStyle}
        >
            {props.dashboardRef.current[props.index]} {/* Render the div element */}

        </EmbedContainer>
    );
});
export default EmbeddedDashboard;

// Styled container for the embedded dashboard
export const EmbedContainer = styled.div`
  width: 100%;
  height: 95vh;
  opacity: 0; 
  transition: opacity 0.5s ease-in-out;

  & > iframe { /* Style the iframe directly as a child of EmbedContainer */
    width: 100%;
    height: 100%;
  }

  &.visible { /* Apply styles when the .visible class is present */
    opacity: 1;
  }
`;
