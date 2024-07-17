# Looker Extension tabbed-dashboard

tabbed-dashboard is a Looker extension using React and TypeScript.


## Configuration File (`.env.development`)

The `tabbed-dashboard` extension allows you to dynamically configure the tabs and their corresponding dashboard IDs using a configuration file named `.env.development`. This file should be located in the root directory of your project.

### Structure

The `.env.development` file should have the following structure:

## Getting Started for Development


* Each line represents a single tab.
* `REACT_APP_TAB_{NUMBER}_NAME`: Specifies the name of the tab that will be displayed.
* `REACT_APP_TAB_{NUMBER}_ID`: Specifies the ID of the Looker dashboard to embed within the tab.
* `{NUMBER}`: A sequential number starting from 1 to identify each tab.

### Adding/Modifying Tabs

1. Open the `.env.development` file in your project's root directory.
2. Add new lines following the format above to create additional tabs.
3. To modify an existing tab, simply change its name or ID.
4. Save the `.env.development` file.

### Development

During development, Create React App will automatically pick up the changes you make to the `.env.development` file. You might need to restart your development server to see the changes reflected in your extension.

### Production

For production deployment, you'll typically need to set the environment variables on your production server through your deployment platform's configuration options. Refer to your platform's documentation for instructions on how to set environment variables in production.

1. Install the dependencies NPM

    ```sh
    NPM install
    ```

2. Build the project

    ```sh
    NPM run develop
    ```

    The development server is now running and serving the JavaScript at https://localhost:8080/bundle.js.

4. Now log in to Looker and create a new project.

    Depending on the version of Looker, a new project can be created under:

    - **Develop** => **Manage LookML Projects** => **New LookML Project**, or
    - **Develop** => **Projects** => **New LookML Project**

    Select "Blank Project" as the "Starting Point". This creates a new LookML project with no files.

5. Create a `manifest` file

   Either drag and upload the `manifest.lkml` file in this directory into your Looker project, or create a `manifest.lkml` with the same content. Change the `id`, `label`, or `url` as needed.

   ```
   application: tabbed-dashboard { 
   label: "Tabbed Dashboards with Filter Consistency"
   url: "https://localhost:8080/bundle.js"
   entitlements: {
   use_iframes: yes
   core_api_methods: ["me"]
   }
   }
   ```

6. Create a `model` LookML file in your project.

   Typically, the model is named the same as the extension project. The model is used to control access to the extension.

   - [Configure the model you created](https://docs.looker.com/data-modeling/getting-started/create-projects#configuring_a_model) so that it has access to some connection (any connection).

7. Connect the new project to Git.

   - Create a new repository on GitHub or a similar service, and follow the instructions to [connect your project to Git](https://docs.looker.com/data-modeling/getting-started/setting-up-git-connection)

8. Commit the changes and deploy them to production through the Project UI.

9. Reload the page and click the `Browse` dropdown menu. You should see the extension label in the list.

   - The extension will load the JavaScript from the `url` you provided in the `application` definition. By default, this is `https://localhost:8080/bundle.js`. If you change the port your server runs on in the `package.json`, you will need to also update it in the `manifest.lkml`.
   - Reloading the extension page will bring in any new code changes from the extension template.

## Deploying the extension

To allow other people to use the extension, build the JavaScript bundle file and directly include it in the project.

1. Build the extension with `npm run build` in the extension project directory on your development machine.
2. Drag and drop the generated `dist/bundle.js` file into the Looker project interface
3. Modify your `manifest.lkml` to use `file` instead of `url`:

   ```
   application: tabbed-dashboard { 
   label: "Tabbed Dashboards with Filter Consistency"
   file: "bundle.js"
   entitlements: {
   use_iframes: yes
   core_api_methods: ["me"]
   }
   }
   ```
