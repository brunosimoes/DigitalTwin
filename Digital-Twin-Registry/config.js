// Generates an HTML file to serve webpack bundles
const HtmlWebPackPlugin = require("html-webpack-plugin");

// Allows sharing of code between multiple webpack builds
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

// Bundles files into a tarball
const TarWebpackPlugin = require("tar-webpack-plugin").default;

// Copies individual files or entire directories to the build directory
const CopyWebpackPlugin = require("copy-webpack-plugin");

// Allows to compute paths
const path = require("path");

// Application settings
const app = require("./config/module.json");

// Registry settings
const fs = require("fs");
const configFilePath = path.resolve(__dirname, "registry", "config", "config.json");
if (!fs.existsSync(configFilePath)) {
  console.error(
    "[ERROR] The framework is not configured. Please run ./orchestrator.sh and configure the builder.",
  );
  process.exit(1);
}

// Import the registry config if it exists
const registry = require(configFilePath);

// Use typescript alias for webpack
const tsconfig = require("./tsconfig.json");

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
  if (app.pathPublicAssets[0] === "Digital-Twin-App") {
    const dt = Object.values(registry).find((app) => app.appManifest);
    app.pathPublicAssets = ["..", "..", dt.rootDir, "public"];
  }
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
    filename: app.routeCapabilities.startsWith("/")
      ? app.routeCapabilities.substring(1)
      : app.routeCapabilities, // Name of the generated manifest file
    exposes: app.exposes, // Exposed modules
    remotes: [], // Remote modules
    shared: {
      ...deps,
      "react": {
        singleton: true,
        requiredVersion: deps.react,
      },
      "react-dom": {
        singleton: true,
        requiredVersion: deps["react-dom"],
      },
      "@mui/icons-material": {
        singleton: true,
        requiredVersion: deps["@mui/icons-material"],
      },
      "@mui/material": {
        singleton: true,
        requiredVersion: deps["@mui/material"],
      },
      "@emotion/react": {
        singleton: true,
        requiredVersion: deps["@emotion/react"],
      },
      "@emotion/styled": {
        singleton: true,
        requiredVersion: deps["@emotion/styled"],
      },
    },
  }),

  // Configure module to export types
  new TarWebpackPlugin({
    action: "c",
    gzip: true,
    C: app.pathTypescript,
    file: "public/" + app.id + "-dts.tgz",
    fileList: ["."],
  }),

  // Setup webpage
  new HtmlWebPackPlugin({
    template: app.pathTemplate,
  }),
];

// IMPORTANT: publicPath should point to local server if in development mode,
// otherwise we wont see any changes
module.exports = {
  ...app,
  alias,
  plugins,
  publicPath:
    app.devServerHost !== undefined && app.devServerHost !== null
      ? app.devServerHost + ":" + app.devServerPort + "/"
      : registry[app.id].url + "/",
};
