const fs = require("fs");

const settings = ctx => ({
  parser: "postcss-scss",
  map: ctx.options.map,
  plugins: {
    "postcss-mesh": {}
  }
});

module.exports = settings;
