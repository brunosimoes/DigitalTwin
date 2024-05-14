const { getConfiguration } = require("./config");

module.exports = async () => {
  const config = await getConfiguration();
  const { id, exposes, alias, plugins, publicPath, devServerPort, pathTypescript } = config;
  return {
    output: {
      publicPath,
    },

    watchOptions: {
      ignored: "**/*.tgz",
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
          use: ["style-loader", "css-loader", "sass-loader", "postcss-loader"],
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
};