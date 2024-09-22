
import { createContext, useContext } from "react";
import aerlTheme from "./aerl";
import blackLightTheme from "./black_light";
import blueLightTheme from "./blue_light";
import greenLightTheme from "./green_light";
import redLightTheme from "./red_light";

// Change this in development to test different themes
const defaultDomain = "aerl.cloud";

/** Branded instance */
export interface Instance {
    company: string;
    themeName: string,
    theme: {
        light: string;
        dark: string;
        type: string;
    };
    logo: string;
    themeLabel: string;
}

/** Domain name */
type Domain = string;

/** Instance registry */
type Instances = Record<Domain, Instance> | any;

const instances: Instances = {
    "aerl.cloud": {
        company: "AERL",
        themeName: "aerl",
        theme: aerlTheme,
        logo: "/logo.webp",
        themeLabel: "aerl-dark-theme"
    },
    "ampcontrol.energy": {
        company: "Ampcontrol",
        themeName: "ampcontrol",
        theme: blackLightTheme,
        logo: "/logos/ampcontrol.png",
        themeLabel: 'black-light-theme'
    },
    "aura.aerl.cloud": {
        company: "Aura",
        themeName: "aura",
        theme: blueLightTheme,
        logo: "/logos/aura.png",
        themeLabel: 'blue-light-theme'
    },
    "cdpower.cloud": {
        company: "CD Power",
        themeName: "cdpower",
        theme: greenLightTheme,
        logo: "/logos/cdpower.png",
        themeLabel: 'green-light-theme'
    },
    "cet.live": {
        company: "CE+T",
        themeName: "cet",
        theme: redLightTheme,
        logo: "/logos/cet.svg",
        themeLabel: 'red-light-theme',
    },
    "powerplus.online": {
        company: "PowerPlus",
        themeName: "powerplus",
        theme: blackLightTheme,
        logo: "/logos/powerplus.svg",
        themeLabel: 'black-light-theme'
    },
    "redearth.aerl.cloud": {
        company: "RedEarth",
        themeName: "redearth",
        theme: blackLightTheme,
        logo: "/logos/redearth.png",
        themeLabel: 'black-light-theme'
    },
    "vaulta.aerl.cloud": {
        company: "Vaulta",
        themeName: "vaulta",
        theme: blackLightTheme,
        logo: "/logos/vaulta.svg",
        themeLabel: 'black-light-theme'
    },
    "zekitek.cloud": {
        company: "ZekiTek",
        themeName: "zekitek",
        theme: blueLightTheme,
        logo: "/logos/zekitek.png",
        themeLabel: 'blue-light-theme'
    },
    "xess.cloud": {
        company: "XESS",
        themeName: "xess",
        theme: blackLightTheme,
        logo: "/logos/xess.png",
        themeLabel: 'black-light-theme'
    },
};

//* Get instance from domain name */
export const getInstanceFromDomain = (domain?: string) => {
    console.log("Domain is", domain);
    // use default theme if not present
    if (!domain || !(domain in instances)) {
        domain = defaultDomain;
    }

    return instances[domain];
};


export const InstanceContext = createContext<Instance>(instances[defaultDomain]); // "aerl.cloud"
