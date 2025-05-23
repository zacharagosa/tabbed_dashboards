# Tabbed Looker Dashboards React/Typescript Example

This is a sample Looker Extension written in TypeScript and React. It demonstrates how to embed multiple Looker dashboards within a tabbed interface using Material-UI (MUI) components. The extension uses the Looker Extension SDK for authentication and the Looker Embed SDK for rendering dashboards.

## Features
- Embed multiple Looker dashboards.
- Navigate dashboards using a tabbed interface.
- Shared filter state across dashboards (basic implementation).
- Customizable tab orientation (horizontal, vertical-left, vertical-right).
- Customizable tab themes (default, dark, compact).

## Setup & Configuration

1.  **Prerequisites:**
    *   Node.js (version specified in `.nvmrc` if present, or latest LTS)
    *   Yarn (recommended) or npm
    *   Access to a Looker instance.

2.  **Environment Variables:**
    Create a `.env.development` file in the root of the project for local development. For production, configure these variables in your deployment environment.

    *   `LOOKER_HOST_NAME`: The hostname of your Looker instance (e.g., `yourinstance.looker.com`). This should **not** include `https://`.
    *   `REACT_APP_TAB_1_NAME`: Name for the first tab.
    *   `REACT_APP_TAB_1_ID`: Looker Dashboard ID for the first tab.
    *   `REACT_APP_TAB_2_NAME`: Name for the second tab.
    *   `REACT_APP_TAB_2_ID`: Looker Dashboard ID for the second tab.
    *   ... (Add more tabs as needed, following the pattern `REACT_APP_TAB_N_NAME` and `REACT_APP_TAB_N_ID`)

    Example `.env.development` for basic tab setup:
    ```
    LOOKER_HOST_NAME=yourinstance.cloud.looker.com
    REACT_APP_TAB_1_NAME="Sales Overview"
    REACT_APP_TAB_1_ID=123
    REACT_APP_TAB_2_NAME="Customer Insights"
    REACT_APP_TAB_2_ID=456
    ```

    ---

    ### Tab Appearance Configuration (Optional)

    You can customize the appearance and layout of the tabs by setting the following environment variables:

    *   **`REACT_APP_TAB_ORIENTATION`**: Controls the layout of the tabs.
        *   Possible values:
            *   `horizontal` (Default): Tabs are displayed at the top.
            *   `vertical-left`: Tabs are displayed on the left side.
            *   `vertical-right`: Tabs are displayed on the right side.
        *   Example: `REACT_APP_TAB_ORIENTATION=vertical-left`

    *   **`REACT_APP_TAB_THEME`**: Controls the visual theme of the tabs.
        *   Possible values:
            *   `default` (Default): Standard theme.
            *   `dark`: Dark theme for tabs.
            *   `compact`: Compact theme with reduced spacing and font size.
        *   Example: `REACT_APP_TAB_THEME=dark`

    Example `.env.development` including appearance configuration:
    ```
    LOOKER_HOST_NAME=yourinstance.cloud.looker.com
    REACT_APP_TAB_1_NAME="Sales Overview"
    REACT_APP_TAB_1_ID=123
    REACT_APP_TAB_2_NAME="Customer Insights"
    REACT_APP_TAB_2_ID=456
    REACT_APP_TAB_ORIENTATION=vertical-left
    REACT_APP_TAB_THEME=dark
    ```

## Development

1.  Install dependencies:
    ```bash
    yarn install
    ```
2.  Start the development server:
    ```bash
    yarn develop
    ```
    This will typically start the server on `https://localhost:8080`.

## Building for Production

```bash
yarn build
```
This command bundles the application into the `dist` folder.

## Key Files
- `src/App.tsx`: Main application component, including Material-UI (MUI) ThemeProvider setup for custom themes.
- `src/Tabs.tsx`: Handles tab creation using Material-UI (MUI) components, dashboard embedding logic, and reads environment variables for orientation.
- `src/Dashboards.tsx`: Component for embedding individual Looker dashboards.
- `src/Tabs.css`: Previously contained custom styles for `react-tabs`. Styling is now primarily handled by MUI's theming system (defined in `src/App.tsx`) and component-level `sx` props. This file is now largely empty or contains minimal global overrides.
- `webpack.config.js`: Webpack configuration for bundling.

## License
This project is licensed under the Apache-2.0 License.
