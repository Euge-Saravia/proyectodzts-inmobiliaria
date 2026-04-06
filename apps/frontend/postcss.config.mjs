/** @type {import('postcss').Plugin} */
const bootstrapIconsFontDisplaySwap = {
  postcssPlugin: "bootstrap-icons-font-display-swap",
  Declaration(decl) {
    if (
      decl.prop === "font-display" &&
      decl.value === "block" &&
      decl.parent?.type === "atrule" &&
      decl.parent?.name === "font-face" &&
      decl.parent?.nodes?.some(
        (n) =>
          n.type === "decl" &&
          n.prop === "font-family" &&
          n.value?.includes("bootstrap-icons"),
      )
    ) {
      decl.value = "swap";
    }
  },
};

const config = {
  plugins: [bootstrapIconsFontDisplaySwap],
};

export default config;
