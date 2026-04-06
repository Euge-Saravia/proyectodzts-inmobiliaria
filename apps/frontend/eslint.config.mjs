import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      "react/no-inline-styles": "off",
    },
  },
];

export default eslintConfig;
