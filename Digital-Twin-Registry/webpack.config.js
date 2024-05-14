const config = require("./config");
const { id, exposes, alias, plugins, publicPath, devServerPort, pathTypescript } = config;

module.exports = {
  output: {
    publicPath,
  },

  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    alias,
  },

  devServer: {
    port: devServerPort,
    historyApiFallback: true,
    compress: true,
    allowedHosts: "all"
  },

  optimization: {
    splitChunks: {
      minChunks: 1,
      minSize: 50000,
      minRemainingSize: 0,
      enforceSizeThreshold: 100000,
      cacheGroups: {
        vendors: {
          priority: -5,
          test: /[\\/]node_modules[\\/]/,
          reuseExistingChunk: true,
          chunks: "initial",
          filename: "vendors.[contenthash].js",
          minSize: 0,
        },
        default: {
          priority: -20,
          minChunks: 2,
          reuseExistingChunk: true,
        },
        defaultVendors: false,
        reactPackage: {
          priority: 10,
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
          filename: "react.[contenthash].js",
          chunks: "all",
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.m?js/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(css|s[ac]ss)$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
          },
          {
            loader: "dts-loader",
            options: {
              name: id,
              exposes,
              typesOutputDir: pathTypescript,
            },
          },
        ],
      },
      {
        test: /\.json$/,
        loader: "json-loader",
      },
    ],
  },
  plugins,
};
