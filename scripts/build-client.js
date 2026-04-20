const esbuild = require("esbuild");
const path = require("path");

esbuild
  .build({
    entryPoints: [path.join(__dirname, "..", "src", "client", "app.jsx")],
    bundle: true,
    outfile: path.join(__dirname, "..", "public", "app.js"),
    loader: { ".js": "jsx", ".jsx": "jsx" },
    format: "iife",
    platform: "browser",
    target: ["es2020"],
    sourcemap: false,
    minify: true
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
