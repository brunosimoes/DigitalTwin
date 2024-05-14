// Generates an HTML file to serve webpack bundles
const HtmlWebPackPlugin = require("html-webpack-plugin");

// Allows sharing of code between multiple webpack builds
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

// Allows the use of remote types in a project
const WebpackRemoteTypesPlugin = require("webpack-remote-types-plugin").default;

// Bundles files into a tarball
const TarWebpackPlugin = require("tar-webpack-plugin").default;

// Copies individual files or entire directories to the build directory
const CopyWebpackPlugin = require("copy-webpack-plugin");

// Create WPA
const WorkboxPlugin = require("workbox-webpack-plugin");

// Allows to compute paths
const path = require("path");

// Application settings
const app = require("./config/module.json");
const axios = require("axios");

// Use typescript alias for webpack
const tsconfig = require("./tsconfig.json");

// Define an async function to fetch registry settings
async function fetchRegistry(url) {
  try {
    console.log("Fetching registry from " + url);
    const response = await axios.get(url);
    return response.data.config;
  } catch (error) {
    console.error("Error fetching registry settings:", error);
    process.exit(1); // Exit process if registry fetch fails
  }
}

function configureWebpack(registry) {
  // Set up remotes and aliases
  const remotes = {};
  app.remotes.forEach((id) => {
    if (registry[id] === undefined) console.error("Microfrontend " + id + " is missing");
    else remotes[id] = id + "@" + registry[id].remote;
  });

  // Webpack aliases for file paths
  const alias = {};
  const paths = tsconfig.compilerOptions.paths;
  Object.keys(paths).forEach((key) => {
    const id = key.replace("/*", "");
    const val = paths[key][0].replace("/*", "").replace("./", "");
    if (id.length > 0) alias[id] = path.resolve(__dirname, val); // Resolve file paths for each alias
  });

  // Configure webpack plugins
  let plugins = [];

  // Copy public files to build directory
  if (app.pathPublicAssets && app.pathPublicAssets.length > 0) {
    plugins = [
      new CopyWebpackPlugin({
        patterns: [{ from: path.resolve(__dirname, ...app.pathPublicAssets) }],
      }),
    ];
  }

  // Configure module federation plugin
  const deps = require("./package.json").dependencies;
  plugins = [
    ...plugins,
    new ModuleFederationPlugin({
      name: app.id, // Name of the current application
      filename: app.routeCapabilities.startsWith('/') ? app.routeCapabilities.substring(1) : app.routeCapabilities, // Name of the generated manifest file
      exposes: app.exposes, // Exposed modules
      remotes: remotes, // Remote modules
      shared: {
        ...deps, // Shared dependencies
        "react": {
          singleton: true, // Only one instance of the module is allowed
          requiredVersion: deps.react, // Required version of react
        },
        "react-dom": {
          singleton: true, // Only one instance of the module is allowed
          requiredVersion: deps["react-dom"], // Required version of react-dom
        },
        "@mui/icons-material": {
          singleton: true, // Only one instance of the module is allowed
          requiredVersion: deps["@mui/icons-material"],
        },
        "@mui/material": {
          singleton: true, // Only one instance of the module is allowed
          requiredVersion: deps["@mui/material"],
        },
        "@emotion/react": {
          singleton: true, // Only one instance of the module is allowed
          requiredVersion: deps["@emotion/react"],
        },
        "@emotion/styled": {
          singleton: true, // Only one instance of the module is allowed
          requiredVersion: deps["@emotion/styled"],
        },
        "@iconify/react": {
          singleton: true, // Only one instance of the module is allowed
          requiredVersion: deps["@iconify/react"],
        },
      },
    }),

    // Configure webpack remote types plugin for each remote
    ...app.remotes.map((id) => {
      let url = registry[id].url;
      if (registry[id].enableProxy && process.env.HOSTNAME !== undefined) {
        url = registry[id].url.replace(/localhost/g, process.env.HOSTNAME);
      }
      if (!url.endsWith("/")) url += "/";

      return new WebpackRemoteTypesPlugin({
        remotes: { [id]: `${id}@${url}` },
        outputDir: "types", // Output directory for the remote type
        remoteFileName: `${id}-dts.tgz`, // Name of the generated remote type file
      });
    }),

    // Configure module to export types
    new TarWebpackPlugin({
      action: "c",
      gzip: true,
      C: app.pathTypescript,
      file: `public/${app.id}-dts.tgz`,
      fileList: ["."],
    }),

    // Setup webpage
    new HtmlWebPackPlugin({
      template: app.pathTemplate,
    }),
  ];

  if (app.devServerHost === undefined || app.devServerHost === null) {
    plugins.push(
      new WorkboxPlugin.GenerateSW({
        exclude: ["src_App_tsx.js"],
        maximumFileSizeToCacheInBytes: 10000000000,
        clientsClaim: true,
        skipWaiting: true,
      }),
    );
  }

  return {
    ...app,
    alias,
    plugins,
    publicPath:
      app.devServerHost !== undefined && app.devServerHost !== null
        ? app.devServerHost + ":" + app.devServerPort + "/"
        : registry[app.id].url + "/",
  };
}

async function getConfiguration() {
  try {
    const registry = await fetchRegistry(`${app.devRegistryURL}/config`);
    return configureWebpack(registry);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1); // Exit process if registry fetch fails
  }
}

module.exports = { getConfiguration };
