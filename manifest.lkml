
project_name: "tabbed-dashboards"

application: name {
  label: "label"
  url: "http://localhost:8080/bundle.js"
  # file: "bundle.js
  entitlements: {
    core_api_methods: ["me"] #Add more entitlements here as you develop new functionality
    use_embeds: yes
  }
}