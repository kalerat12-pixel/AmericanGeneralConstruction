import next from "eslint-config-next";

// eslint-config-next v16 default-exports a flat-config array, not a factory.
const config = [
  ...next,
  {
    // scripts/checks are Playwright runners; scripts/preview.js is a raw
    // browser asset inlined into the generated preview, not module source.
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "scripts/checks/**",
      "scripts/preview.js",
    ],
  },
];

export default config;
