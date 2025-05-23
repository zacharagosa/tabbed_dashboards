// Copyright 2021 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
  * This is a sample Looker Extension written in typescript and React. It imports one component, <HelloWorld>.
  * HelloWorld makes a simple call to the Looker API using the Extension Framework's built in authentication,
  * and returns the logged in user.
*/
import React from 'react';
import { ExtensionProvider40 } from '@looker/extension-sdk-react';
import { hot } from 'react-hot-loader/root';
import { ThemeProvider, createTheme, ThemeOptions } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// Potentially colors for theme customization: import { blue, pink } from '@mui/material/colors';

import { TabbedDashboards } from "./Tabs";

export const App = hot(() => {
    // Inside App component in App.tsx, before the return statement
    const tabThemeEnv = process.env.REACT_APP_TAB_THEME || 'default';
    
    let themeOptions: ThemeOptions = {
        palette: {
            mode: 'light', // Default to light
            // Define primary/secondary if needed, or use MUI defaults
            // primary: { main: '#1976d2' }, 
            // secondary: { main: '#dc004e' },
        },
        // Base component style overrides
        components: {
            MuiTab: {
                styleOverrides: {
                    root: { // Default styling for all tabs
                        minHeight: '48px', // MUI default, can be adjusted for compact
                        padding: '6px 16px', // MUI default, can be adjusted
                    },
                },
            },
            MuiTabs: {
                styleOverrides: {
                    root: { // Default styling for Tabs container
                        minHeight: '48px', // MUI default
                    },
                    indicator: {
                        // backgroundColor: '#yourIndicatorColor', // Example
                    }
                }
            }
        }
    };

    if (tabThemeEnv === 'dark') {
        themeOptions = {
            ...themeOptions,
            palette: {
                ...themeOptions.palette,
                mode: 'dark',
            },
        };
    } else if (tabThemeEnv === 'compact') {
        themeOptions = {
            ...themeOptions,
            components: {
                ...themeOptions.components,
                MuiTab: {
                    styleOverrides: {
                        root: {
                            minHeight: '36px', // Compact minHeight
                            padding: '0px 10px', // Compact padding
                            fontSize: '0.8rem',
                        },
                    },
                },
                MuiTabs: {
                    styleOverrides: {
                        root: {
                            minHeight: '36px', // Compact minHeight
                        },
                    },
                },
            },
        };
    }
    // If 'dark' and 'compact' themes need to be combined, more complex logic would merge these.
    // For now, 'compact' overrides 'dark' if both were somehow specified; assume distinct.

    const theme = createTheme(themeOptions);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ExtensionProvider40>
                <TabbedDashboards />
            </ExtensionProvider40>
        </ThemeProvider>
    );
});
