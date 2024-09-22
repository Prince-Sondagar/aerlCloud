/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/react");
const aerl = require("./src/components/themes/aerl");
const blackLightTheme = require("./src/components/themes/black_light");
const blueLightTheme = require("./src/components/themes/blue_light");
const greenLightTheme = require("./src/components/themes/green_light");
const redLightTheme = require("./src/components/themes/red_light");

module.exports = {
  content: [
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        md: "960px",
        sm: "650px",
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      prefix: "nextui",
      addCommonColors: false,
      defaultTheme: "light",
      defaultExtendTheme: "light",
      themes: {
        aerl: aerl.light,
        ampcontrol: blackLightTheme.light,
        aura: blueLightTheme.light,
        cdpower: greenLightTheme.light,
        cet: redLightTheme.light,
        powerplus: blackLightTheme.light,
        redearth: blackLightTheme.light,
        vaulta: blackLightTheme.light,
        zekitek: blueLightTheme.light,
        xess: blackLightTheme.light
      }
    }),
  ],
};
