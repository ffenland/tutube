const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  // entry means SourceCode
  entry: {
    main: "./src/client/js/main.js",
    videoPlayer: "./src/client/js/videoPlayer.js",
  },
  mode: "development",
  watch: true,
  output: {
    filename: "js/[name].js", // name = entry에 넘겨준 Object의 Key
    path: path.resolve(__dirname, "assets"),
    clean: true,
  },
  plugins: [new MiniCssExtractPlugin({ filename: "css/styles.css" })],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        // 여러개의 로더를 등록할땐 사용되는 순서의 역순으로 배열에 넣어준다.
        // style-loader는 css를 js안에 넣어주는 방식.
        // MiniCssExtractPlugin은 별도의 CSS파일을 만들어주는 방식
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
};
