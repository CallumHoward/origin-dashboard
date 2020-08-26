const webpack = require("webpack");
const path = require("path");

// 1. import default from the plugin module
const createStyledComponentsTransformer = require("typescript-plugin-styled-components")
  .default;

// 2. create a transformer;
// the factory additionally accepts an options object which described below
const styledComponentsTransformer = createStyledComponentsTransformer();

module.exports = {
  entry: {
    app: ["./src/App.tsx"],
    vendor: ["react", "react-dom"],
  },
  mode: "development",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        include: /src|_proto/,
        exclude: /node_modules/,
        loader: "ts-loader",
        options: {
          getCustomTransformers: () => ({
            before: [styledComponentsTransformer],
          }),
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
  },
  plugins: [
    new webpack.DefinePlugin({
      USE_TLS: process.env.USE_TLS !== undefined,
    }),
  ],
};
