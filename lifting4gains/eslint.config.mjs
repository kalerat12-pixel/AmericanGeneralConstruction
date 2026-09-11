import next from "eslint-config-next";

// eslint-config-next v16 default-exports a flat-config array, not a factory.
const config = [
  ...next,
  {
    ignores: [".next/**", "node_modules/**", "public/**", "scripts/checks/**"],
  },
];

export default config;
