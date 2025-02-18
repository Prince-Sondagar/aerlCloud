/* eslint-disable react-hooks/rules-of-hooks */
/** Apple icon */

import { getThemes } from "../../util";

export const Apple = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 842 1000"
    >
      <path
        fill="#b3b3b3"
        d="m 824.66636,779.30363 c -15.12299,34.93724 -33.02368,67.09674 -53.7638,96.66374 -28.27076,40.3074 -51.4182,68.2078 -69.25717,83.7012 -27.65347,25.4313 -57.2822,38.4556 -89.00964,39.1963 -22.77708,0 -50.24539,-6.4813 -82.21973,-19.629 -32.07926,-13.0861 -61.55985,-19.5673 -88.51583,-19.5673 -28.27075,0 -58.59083,6.4812 -91.02193,19.5673 -32.48053,13.1477 -58.64639,19.9994 -78.65196,20.6784 -30.42501,1.29623 -60.75123,-12.0985 -91.02193,-40.2457 -19.32039,-16.8514 -43.48632,-45.7394 -72.43607,-86.6641 C 77.707522,829.30207 52.171259,778.62464 32.165691,720.84861 10.740416,658.44309 0,598.01283 0,539.50845 0,472.49197 14.481044,414.69125 43.486336,366.25444 66.28194,327.34823 96.60818,296.6578 134.5638,274.1276 c 37.95566,-22.53016 78.96676,-34.01129 123.1321,-34.74585 24.16591,0 55.85633,7.47508 95.23784,22.166 39.27042,14.74029 64.48571,22.21538 75.54091,22.21538 8.26518,0 36.27668,-8.7405 83.7629,-26.16587 44.90607,-16.16001 82.80614,-22.85118 113.85458,-20.21546 84.13326,6.78992 147.34122,39.95559 189.37699,99.70686 -75.24463,45.59122 -112.46573,109.4473 -111.72502,191.36456 0.67899,63.8067 23.82643,116.90384 69.31888,159.06309 20.61664,19.56727 43.64066,34.69027 69.2571,45.4307 -5.55531,16.11062 -11.41933,31.54225 -17.65372,46.35662 z M 631.70926,20.0057 c 0,50.01141 -18.27108,96.70693 -54.6897,139.92782 -43.94932,51.38118 -97.10817,81.07162 -154.75459,76.38659 -0.73454,-5.99983 -1.16045,-12.31444 -1.16045,-18.95003 0,-48.01091 20.9006,-99.39207 58.01678,-141.40314 C 497.65157,54.696 521.21876,37.0095 549.79815,22.90064 578.3158,9.00229 605.2903,1.31621 630.65988,0 c 0.74076,6.68575 1.04938,13.37191 1.04938,20.00505 z"
        id="path4"
      />
    </svg>
  );
};

/** Google icon */
export const Google = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 256 262"
    >
      <path
        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
        fill="#4285F4"
      />
      <path
        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
        fill="#34A853"
      />
      <path
        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
        fill="#FBBC05"
      />
      <path
        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
        fill="#EB4335"
      />
    </svg>
  );
};

/** Microsoft icon */
export const Microsoft = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 23 23"
    >
      <path fill="#f35325" d="M1 1h10v10H1z" />
      <path fill="#81bc06" d="M12 1h10v10H12z" />
      <path fill="#05a6f0" d="M1 12h10v10H1z" />
      <path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
  );
};

/** Circle icon */
export const Circle = ({ size, color }: { size?: number; color?: string }) => {
  return (
    <svg
      width={size ?? 16}
      height={size ?? 16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.95782 14.913C6.58193 14.9133 5.23686 14.5055 4.09272 13.7413C2.94857 12.9771 2.05673 11.8908 1.52999 10.6198C1.00324 9.34868 0.865247 7.94996 1.13345 6.60046C1.40166 5.25097 2.06402 4.01131 3.03678 3.03826C3.84558 2.22921 4.84143 1.63211 5.93612 1.29986C7.0308 0.967605 8.19053 0.910448 9.31258 1.13345C10.4346 1.35645 11.4844 1.85273 12.3688 2.57833C13.2533 3.30393 13.9451 4.23645 14.3831 5.29329C14.821 6.35013 14.9916 7.49867 14.8797 8.63718C14.7677 9.77569 14.3767 10.869 13.7413 11.8203C13.1059 12.7716 12.2457 13.5516 11.2369 14.091C10.2281 14.6305 9.10182 14.9128 7.95782 14.913Z"
        fill={color ?? "white"}
      />
    </svg>
  );
};

/** Copy icon */
export const Copy = ({ size, color }: { size?: number; color?: string }) => {
  return (
    <svg
      width={size ?? 16}
      height={size ?? 16}
      viewBox="0 1 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" />
      <path
        d="M7 5C5 5 4 7 4 9V17C4 19 5 20.9976 8 20.9976C8 20.9976 13.4869 20.9842 13 20.9976C16 20.9976 17 20 17 18"
        stroke={color ?? "white"}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M16.4842 3C16.4842 3 10.4955 3.00326 10.4862 3.00326C8.33315 3.01711 7 4.49674 7 6.75366V14.2463C7 16.5147 8.34329 18 10.515 18C10.515 18 16.5029 17.9976 16.5131 17.9976C18.6661 17.9837 20 16.5033 20 14.2463V6.75366C20 4.48533 18.6559 3 16.4842 3Z"
        stroke={color ?? "white"}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

/** Battery clipart */
export const Battery = () => {
  const { theme } = getThemes();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={100}
      height={100}
      viewBox="0 0 600 500"
      style={{
        margin: "0 auto",
      }}
    >
      <path
        d="M455.706 255.495h-283.95v119.22h283.95l118.6-119.22z"
        fill="#11111160"
      />
      <path
        d="M168.936 113.285l-11.55 9.05c-3.01 2.36-4.77 5.97-4.77 9.79v50.62c0 6.87 5.57 12.44 12.44 12.44h266.11c4.98 0 9.79-1.8 13.55-5.06l10.83-9.41c.91-.79 1.44-1.94 1.44-3.16v-55.08c0-6.45-5.23-11.68-11.68-11.68h-269.17a11.67 11.67 0 0 0-7.2 2.49z"
        fill={theme?.colors?.primary}
      />
      <path
        d="M161.466 135.375h268.57v50.96h-268.57z"
        fill={theme?.colors?.primaryLight}
      />
      <g fill={theme?.colors?.primary}>
        <path d="M184.046 149.345h134.66v4.13h-134.66zm0 17.15h134.66v4.13h-134.66z" />
        <use xlinkHref="#B" />
        <use xlinkHref="#B" y="20.71" />
      </g>
      <use xlinkHref="#C" fill={theme?.colors?.primary} />
      <path
        d="M161.466 231.635h268.57v50.96h-268.57z"
        fill={theme?.colors?.primaryLight}
      />
      <g fill={theme?.colors?.primary}>
        <path d="M184.046 245.615h134.66v4.13h-134.66zm0 17.14h134.66v4.13h-134.66z" />
        <use xlinkHref="#D" />
        <use xlinkHref="#B" y="116.97" />
      </g>
      <use xlinkHref="#C" y="97.76" fill={theme?.colors?.primary} />
      <path
        d="M161.466 329.405h268.57v50.96h-268.57z"
        fill={theme?.colors?.primaryLight}
      />
      <g fill={theme?.colors?.primary}>
        <path d="M184.046 343.375h134.66v4.13h-134.66zm0 17.14h134.66v4.13h-134.66z" />
        <use xlinkHref="#B" y="194.03" />
        <use xlinkHref="#D" y="118.47" />
      </g>
      <g fill={theme?.colors?.primary}>
        <use xlinkHref="#E" />
        <use xlinkHref="#E" y="96.37" />
        <path d="M443.926 384.855l11.4-9.9c1.05-.92 1.66-2.24 1.66-3.64v-54.78c0-4.93-3.39-8.23-3.39-8.23l-14.71 14.96v64.48s2.28-.78 5.04-2.89z" />
      </g>
      <defs>
        <path
          id="B"
          d="M407.186 144.495h-1.48c-3.31 0-6 2.69-6 6h0c0 3.31 2.69 6 6 6h1.48c3.31 0 6-2.69 6-6h0a6 6 0 0 0-6-6z"
        />
        <path
          id="C"
          d="M168.936 209.545l-11.55 9.05c-3.01 2.36-4.77 5.97-4.77 9.79v50.62c0 6.87 5.57 12.44 12.44 12.44h266.11c4.98 0 9.79-1.8 13.55-5.06l10.83-9.41c.91-.79 1.44-1.94 1.44-3.16v-55.08c0-6.45-5.23-11.68-11.68-11.68h-269.17a11.73 11.73 0 0 0-7.2 2.49z"
        />
        <path
          id="D"
          d="M407.186 240.765h-1.48c-3.31 0-6 2.69-6 6h0c0 3.31 2.69 6 6 6h1.48c3.31 0 6-2.69 6-6h0c0-3.32-2.68-6-6-6z"
        />
        <path
          id="E"
          d="M443.926 190.805l11.4-9.9c1.05-.92 1.66-2.24 1.66-3.64v-54.78c0-4.93-3.39-8.23-3.39-8.23l-14.71 14.96v64.48c0-.01 2.28-.79 5.04-2.89z"
        />
      </defs>
    </svg>
  );
};

/** Charger clipart */
export const Charger = () => {
  const { theme } = getThemes();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 500"
      width="100"
      height="100"
      style={{
        margin: "0 auto",
      }}
    >
      <path d="M503.467 313.325h-83.27l-.07 60.19z" fill="#11111160" />
      <path
        d="M409.487 98.245l-192.76-.02c-1.77 0-3.52.44-5.07 1.29l-42.77 23.18c-3.43 1.86-5.57 5.45-5.57 9.36v259.08c0 5.88 4.77 10.64 10.64 10.64h204.9c2.3 0 4.54-.75 6.38-2.12l30.63-22.94c2.68-2.01 4.26-5.17 4.26-8.52v-259.31c.01-5.88-4.76-10.64-10.64-10.64z"
        fill={theme?.colors?.primary}
      />
      <path
        d="M225.867 393.005h-49.52a4.51 4.51 0 0 1-4.51-4.51v-249.51a4.51 4.51 0 0 1 4.51-4.51h49.52zm143.06 0h-49.52v-258.53h49.52a4.51 4.51 0 0 1 4.51 4.51v249.51c0 2.49-2.01 4.51-4.51 4.51zm-133.86-258.53h75.15v258.54h-75.15z"
        fill={theme?.colors?.primaryLight}
      />
      <path
        d="M272.637 242.015a4.38 4.38 0 0 0 4.38-4.38v-74.23a4.38 4.38 0 0 0-8.76 0v74.23a4.38 4.38 0 0 0 4.38 4.38z"
        fill={theme?.colors?.primary}
      />
      <path
        d="M382.407 401.775l37.73-28.25v-262.62c.66-6.83-3.39-9.8-3.39-9.8l-34.34 29.05z"
        fill={theme?.colors?.primaryShadow}
      />
    </svg>
  );
};

/** Generator clipart */
export const Generator = () => {
  const { theme } = getThemes();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 600 500"
      width="100"
      height="100"
      style={{
        margin: "0 auto",
      }}
    >
      <path d="M477.473 346.63l100.12-78.49h-96.94z" fill="#11111160" />
      <path
        d="M167.203 93.22l-56.62 38.98c-4.12 2.83-6.57 7.51-6.57 12.51V378.3c0 8.39 6.8 15.19 15.19 15.19h37.87v15.97h206.85v-15.97l49-.22c3.39-.02 6.67-1.16 9.33-3.26l52.57-41.41a15.18 15.18 0 0 0 5.79-11.93V105.73c0-8.39-6.8-15.19-15.19-15.19h-289.61c-3.07 0-6.07.94-8.61 2.68z"
        fill={theme?.colors?.primary}
      />
      <path
        d="M400.643 384.63h-279.13c-4.77 0-8.64-3.87-8.64-8.64v-230.4h63.43V273.4c0 4.77 3.87 8.64 8.64 8.64h150.28c4.77 0 8.64-3.87 8.64-8.64V145.59h65.43v230.4c-.01 4.78-3.88 8.64-8.65 8.64zM185.163 271V147.77c0-1.2.98-2.18 2.18-2.18h145.47c1.2 0 2.18.98 2.18 2.18v123.22c0 1.2-.98 2.18-2.18 2.18h-145.47a2.17 2.17 0 0 1-2.18-2.17zm232.59-134.27l-296.7-.14c-1.47 0-2.06-1.9-.85-2.73l54.11-37.25a1.52 1.52 0 0 1 .85-.26l289.88.15c1.42 0 2.04 1.79.93 2.67l-47.29 37.25c-.27.2-.6.31-.93.31z"
        fill={theme?.colors?.primaryLight}
      />
      <path
        d="M286.063 163.75h-33.16l-23.99 39.67h29.06l-32.09 53.52 71.84-57.08h-37.79z"
        fill={theme?.colors?.primary}
      />
      <g fill={theme?.colors?.primary}>
        <path d="M257.743 119.8h61.86a6.1 6.1 0 0 0 6.1-6.1h0a6.1 6.1 0 0 0-6.1-6.1h-61.86a6.1 6.1 0 0 0-6.1 6.1h0a6.1 6.1 0 0 0 6.1 6.1z" />
      </g>
      <path
        d="M419.833 391.84l54.47-42.83c4.01-3.15 6.34-7.97 6.34-13.06l-.04-46.6V108.27c.28-4.76-.85-8.06-2-10.14l-58.65 49.24z"
        fill={theme?.colors?.primaryShadow}
      />
      <defs>
        <path
          id="B"
          d="M144.683 314.57h93.17c.98 0 1.77.79 1.77 1.77h0c0 .98-.79 1.77-1.77 1.77h-93.17c-.98 0-1.77-.79-1.77-1.77h0c0-.98.79-1.77 1.77-1.77z"
        />
      </defs>
    </svg>
  );
};

/** Grid connection clipart */
export const Grid = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      width="100"
      height="100"
    >
      <path
        d="M407.78 282.15v-1.08l-1.01-.33.36-.28-.99.08-2.13-.68v1.08l1.06.34-.55.43-1.47-.47v1.08l.5.16-.96.76-20.53-4.76.25-.18-.76.06-1.5-.35 2.03-1.19 2.54.81v-1.08l-1.35-.43.67-.39 1.64.52v-1.08l-.44-.14 2.09-1.22-1.15.09-1.58.93-2.69-.86v1.08l1.5.48-.67.39-1.79-.57v1.08l.6.19-2.1 1.23-20.89-4.84 1.19-.74 2.48.79v-1.08l-1.33-.43.65-.4 1.65.53v-1.08l-.5-.16 1.77-1.1-1.15.09-1.28.79-2.62-.84v1.08l1.47.47-.65.4-1.79-.57v1.08l.64.21-1.26.78-4.35-1.01v2.57l2.03.47c-2.25 7.62-13.06 35.71-54.19 45.73v-1.79l-2.35-.75 1.61-1.4-1.99.16-.94.82-3.79-1.21v2.13l2 .64-1.01.88-2.9-.93v2.13l1.11.35-.91.8-.56.09-5.18-1.2v3.61l2.37.55c-5.74 9.81-29.14 43.5-78.48 51.12v-.12l-2.88-.92 1.16-.83 3.63 1.16v-2.13l-1.58-.5 1.74-1.25-1.99.16-.97.7-4.66-1.49v2.13l2.61.84-1.15.83-3.36-1.08v2.13l1.31.42-1.23.88-.29.03-4.46-1 .94 4.69 39.69 8.93-108.54 66.38 20.48-1.69 98.28-62.39 47.28 10.64-.94-4.69-6.51-1.46c.96-.31 1.89-.65 2.82-.98l2.68.86v-1.83c40.07-15.23 55.84-45.63 59.6-54.42l4.53 1.05v-3.61l-1.06-.25.83-.36 3.6 1.15v-2.13l-.95-.3 1.49-.72 1.37.44v-1.18c32.63-17.4 37.64-42.91 38.43-48.98l2.7.62v-2.57l-1.38-.32.89-.71 2.54.81v-1.08l-1.57-.5.55-.43 1.95.63zm-51.41-7.04l19.5 4.52-67.29 46.77c.27.05.49.14.67.25v.02l-15.35-3.56c.77-.13 1.53-.27 2.27-.42l3.13 1v-1.65c43.52-9.73 54.79-39.19 57.07-46.93zm17.49 9.37c-7.71 9.09-24.71 26.25-50.02 36.63l50.02-36.63zm-76.79 35.16l3.55 1.14-2.22.49-2.33-.75 1-.88zm-2.8 2.43l.03.01c-.01 0-.03 0-.04.01l.01-.02zm-3.85 3.84l25.76 5.97-87.41 51.6-21.24-4.78c.66-.09 1.3-.2 1.95-.3l.69.22v-.33c50.7-7.63 74.5-42.41 80.25-52.38zm-36.46 58.9l-1.78-.57 1.47-.91 2.36.75-2.05.73zm-3.83 1.24l-1.64.49 1.08-.67.56.18zm6.13-4.34l2.2-1.37-1.99.16-1.35.84-5.72-1.83v2.46l3.12 1-1.47.91-3.85-1.23v2.46l1.24.4-2.82 1.76-6.93-1.56 78.76-49.05c-6.46 10.36-24.14 33.47-59.45 46.7v-1.1l-1.74-.55zm60.78-49.59c-.07-.02-.12-.07-.19-.09l2.08.48-1.89-.39zm-111.79 44.92l.55.18c-.31.04-.63.06-.94.1l.39-.28zm85.96 16.34l.99-1.09 2.37.76-1.97.78-1.39-.45zm5.25-1.08v-1.14l-2.5-.8 1.17-1.29-1.99.16-.61.66-4.8-1.54v2.5l3.04.97-.99 1.09-4.29-1.37v2.5l2.53.81-.71.78-1.92.58-36.4-8.19c1.25-.37 2.47-.76 3.68-1.16l3.12 1v-2.05c39.12-13.82 57.41-39.99 63.28-50.17l3.63-2.26 29.39 6.81c-3.62 8.37-18.49 36.81-55.63 52.11zm60.07-55.2l.18-.13.07.02c-.08.04-.17.07-.25.11zm2.96-1.38l-.79-.25 1.12-.84 1.15.37-1.48.72zm4.02-2.04l-1.69-.54 2.15-1.61-1.99.16-1.4 1.05-4.4-1.41v2.13l2.41.77-1.12.84-3.19-1.02v2.13l1.2.38-.81.61-31.15-7.21 1.05-.78 4.77 1.53v-2.13l-2.75-.88 1.13-.84 3.53 1.13v-2.13l-1.51-.48 2.2-1.63-1.99.16-1.44 1.07-4.71-1.51v2.13l2.7.86-1.13.84-3.47-1.11v2.13l1.46.47-1.16.86-7.59-1.76 6.29-4.61c30.25-11.36 49.43-32.68 56.06-41.05l2.45-1.8 21.69 5.03c-.77 5.92-5.59 30.99-37.59 48.22z"
        opacity=".58"
        fill="#020203"
        enable-background="new"
      />
      <path
        d="M352.79 176.48v-1.96h-3.04v-2.29h-1.39v2.29h-3.43v1.96h3.43v.84h-3.43v1.96h3.43v.84h-3.43v1.96h3.43v2.75h-30.43v-3.79a2.18 2.18 0 0 0-2.18-2.18h0v-1.55h3.04v-1.96h-3.04v-.84h3.04v-1.96h-3.04v-.84h3.04v-1.96h-3.04v-2.29h-1.39v2.29h-3.43v1.96h3.43v.84h-3.43v1.96h3.43v.84h-3.43v1.96h3.43v1.55h-.39c-1.2 0-2.18.98-2.18 2.18v3.79h-30.35v-2.75h3.35v-1.96h-3.35v-.84h3.35v-1.96h-3.35v-.84h3.35v-1.96h-3.35v-2.34h-1.39v2.34h-3.12v1.96h3.12v.84h-3.12v1.96h3.12v.84h-3.12v1.96h3.12v2.75h-1.67a1.45 1.45 0 0 0-1.45 1.45h0a1.45 1.45 0 0 0 1.45 1.45h33.42l.06 143.22a3.07 3.07 0 0 0 3.07 3.07h0a3.07 3.07 0 0 0 3.07-3.07l-.06-143.21h33.41a1.45 1.45 0 0 0 1.45-1.45h0a1.45 1.45 0 0 0-1.45-1.45h-1.59v-2.75h3.04v-1.96h-3.04v-.84h3.04v-1.96h-3.04v-.84h3.03v-.01z"
        fill="#f5a524"
      />
      <g fill="#fff">
        <path d="M260.39 192.72c-6.58 0-13.58-.7-20.12-2.49-28.27-7.75-56.01-31.13-56.01-47.2h2.29c0 14.91 27.12 38.03 54.03 45.41 15.31 4.2 32.87 2.87 37.91-1.09.86-.67 1.58-1.79 1.56-2.51h1.39c.03 1.02-.55 2.36-2.36 3.79-3.46 2.71-10.32 4.09-18.69 4.09zm79.8-3.02c-7.56 0-17.61-2.61-23.01-7.27-18.94-16.35-20.93-33.84-20.43-42.8l2.28.13c-.47 8.54 1.45 25.22 19.65 40.94 7.06 6.1 23.01 9.44 28.24 6.2 1.35-.84 1.44-1.84 1.44-2.07h1.39c0 1.1-.48 2.62-2.78 3.68-1.77.8-3.86 1.19-6.78 1.19z" />
        <path d="M300.41 186.56c-5.67 0-11.97-1.15-17.24-3.42-27.47-11.83-42.59-31.46-42.59-55.29h2.29c0 22.85 14.64 41.74 41.21 53.18 11.81 5.29 22.96 4.72 28.08 1.14 1.42-.89 2.01-2.12 2.06-3.31h1.64c-.09 1.96-1.23 3.67-3.29 4.97-2.87 1.79-7.2 2.73-12.16 2.73z" />
      </g>
      <path
        d="M304.06 124.39v-3.24h-5.02v-3.78h-2.3v3.78h-5.66v3.24h5.66v1.39h-5.66v3.24h5.66v1.39h-5.66v3.24h5.66v4.54h-50.26v-6.26a3.59 3.59 0 0 0-3.59-3.59h0v-2.55h5.02v-3.24h-5.02v-1.39h5.02v-3.24h-5.02v-1.39h5.02v-3.24h-5.02v-3.78h-2.3v3.78h-5.66v3.24h5.66v1.39h-5.66v3.24h5.66v1.39h-5.66v3.24h5.66v2.55h-.64a3.59 3.59 0 0 0-3.59 3.59v6.26h-50.13v-4.54h5.53v-3.24h-5.53v-1.39h5.53v-3.24h-5.53v-1.39h5.53v-3.24h-5.53v-3.87h-2.3v3.87h-5.16v3.24h5.16v1.39h-5.16v3.24h5.16v1.39h-5.16v3.24h5.16v4.54h-2.76a2.4 2.4 0 0 0-2.4 2.4h0a2.4 2.4 0 0 0 2.4 2.4h55.2v239.06a5.07 5.07 0 0 0 5.07 5.07h0a5.07 5.07 0 0 0 5.07-5.07V142.98h55.2a2.4 2.4 0 0 0 2.4-2.4h0a2.4 2.4 0 0 0-2.4-2.4h-2.63v-4.54h5.02v-3.24h-5.02v-1.39h5.02v-3.24h-5.02v-1.39l4.98.01h0z"
        fill="#f5a524"
      />
      <g fill="#fff">
        <path d="M161.21 148.17c-6.59 0-14.11-.9-22.1-3-51.09-13.46-69.63-43.98-69.63-61.21h2.29c0 15.89 18.44 45.96 67.92 59 19.45 5.13 36.31 2.84 42.31-1.92.89-.71 1.95-1.82 1.92-3.07l2.29-.07c.03 1.21-.42 3.05-2.79 4.93-4.01 3.17-11.99 5.34-22.21 5.34zm108.5.96c-5.66 0-11.19-.9-15.58-3.1-30.14-15.13-43.87-43.31-43.87-63.09h2.29c0 19.1 13.33 46.35 42.61 61.04 10.95 5.5 30.76 2.14 38.77-2.8 1.76-1.09 2.82-2.21 2.82-3h2.29c0 1.68-1.31 3.35-3.9 4.95-5.31 3.28-15.57 6-25.43 6z" />
        <path d="M240.58 128.28c-.04.93-.95 1.75-1.7 2.28-6.69 4.72-28.6 6.6-43.68 1.99-32.42-9.92-50.27-36.41-52.4-59.19l-2.3-.03c2.12 23.63 20.52 51.16 54.03 61.41 6.29 1.92 13.59 2.76 20.59 2.76 10.73 0 20.7-1.98 25.09-5.07 1.7-1.2 2.6-2.57 2.67-4.05l-2.3-.1z" />
      </g>
      <path
        d="M212.84 82.25v-5.66h6.27v-4.05h-6.27V70.8h6.27v-4.05h-6.27v-1.74h6.27v-4.05h-6.27v-4.72h-2.87v4.72h-7.07v4.05h7.07v1.74h-7.07v4.05h7.07v1.74h-7.07v4.05h7.07v5.66h-62.72v-7.81a4.49 4.49 0 0 0-4.48-4.49h0v-3.19h6.27v-4.05h-6.27v-1.74h6.27v-4.05h-6.27V55.2h6.27v-4.05h-6.27v-4.72h-2.87v4.72h-7.07v4.05h7.07v1.74h-7.07v4.05h7.07v1.74h-7.07v4.05h7.07v3.19h-.8a4.48 4.48 0 0 0-4.48 4.48v7.81H72.05V76.6h6.9v-4.05h-6.9v-1.74h6.9v-4.05h-6.9v-1.74h6.9v-4.05h-6.9v-4.83h-2.87v4.83h-6.43v4.05h6.43v1.74h-6.43v4.05h6.43v1.74h-6.43v4.05h6.43v5.66h-3.45c-1.65 0-2.99 1.34-2.99 2.99h0c0 1.65 1.34 2.99 2.99 2.99h68.87l-.02 360.17a6.32 6.32 0 0 0 6.32 6.32h0a6.32 6.32 0 0 0 6.32-6.32l.02-360.17h68.87c1.65 0 2.99-1.34 2.99-2.99h0c0-1.65-1.34-2.99-2.99-2.99h-3.27v-.01z"
        fill="#f5a524"
      />
    </svg>
  );
};

/** AC load clipart */
export const Load = () => {
  const { theme } = getThemes();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 500"
      width="100"
      height="100"
      style={{
        margin: "0 auto",
      }}
    >
      <path
        d="M348.472 94.025l-92.98 1.41-174.66 133.22c-4.31 3.29-1.99 10.18 3.44 10.18h33.37v158.67a8.47 8.47 0 0 0 8.47 8.47h258.63c5.26 0 10.4-1.62 14.72-4.63l51.09-35.67c5.23-3.65 8.34-9.61 8.35-15.99l.19-119.69 21.84-11.74c6.53-3.51 7.35-12.56 1.56-17.18z"
        fill={theme?.colors?.primary}
      />
      <path
        d="M451.172 365.315l95.79-65.69h-87.84v48.5c.26 11.56-8.11 17.3-7.95 17.19z"
        fill="#11111160"
      />
      <path
        d="M392.822 404.655v-165.72l48.51-.11 17.76-8.83.03 118.6c0 7.06-3.45 13.66-9.24 17.69l-51 35.47z"
        fill={theme?.colors?.primaryShadow}
      />
      <path
        d="M127.282 229.435v95.37h-.09v71.76h255.99l-.09-167.07 45.78-.01-165.23-127.93-8.1 5.74.07.05-160.06 122.09z"
        fill={theme?.colors?.primaryLight}
      />
      <path
        d="M194.342 205.535h48.91v48.91h-48.91z"
        fill={theme?.colors?.primary}
      />
      <path d="M203.742 214.935h30.11v30.11h-30.11z" fill="#fff" />
      <path
        d="M269.182 205.535h48.91v48.91h-48.91z"
        fill={theme?.colors?.primary}
      />
      <path d="M278.582 214.935h30.11v30.11h-30.11z" fill="#fff" />
      <path
        d="M194.342 279.575h48.91v48.91h-48.91z"
        fill={theme?.colors?.primary}
      />
      <path d="M203.742 288.975h30.11v30.11h-30.11z" fill="#fff" />
      <path
        d="M269.182 279.575h48.91v48.91h-48.91z"
        fill={theme?.colors?.primary}
      />
      <path d="M278.582 288.975h30.11v30.11h-30.11z" fill="#fff" />
    </svg>
  );
};

/** Solar panel clipart */
export const Solar = () => {
  const { theme } = getThemes();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 500"
      width="100"
      height="100"
      style={{
        margin: "0 auto",
      }}
    >
      <path d="M518.991 283.869h-89.8l-51 83.82z" fill="#11111160" />
      <path
        d="M236.831 169.509l-124.77 155.84c-1.53 1.91-2.36 4.27-2.36 6.72v29.47c0 5.93 4.81 10.75 10.75 10.75h243.24c9.01 0 17.34-4.81 21.84-12.63l95.12-165.16c.58-1 .88-2.14.88-3.29v-23c0-3.65-2.95-6.6-6.6-6.6h-221.64a21.06 21.06 0 0 0-16.46 7.9z"
        fill={theme?.colors?.primary}
      />
      <path
        d="M248.021 168.899h93.94c2.33 0 3.71 2.61 2.39 4.54l-26.49 38.53c-.54.79-1.43 1.25-2.39 1.25h-98.18c-2.43 0-3.78-2.8-2.26-4.7l30.73-38.53c.55-.69 1.38-1.09 2.26-1.09zm-41.17 51.62h99.62c2.33 0 3.71 2.61 2.39 4.54l-30.7 44.64c-.54.79-1.43 1.25-2.39 1.25h-104.53c-2.43 0-3.78-2.8-2.26-4.7l35.61-44.64c.55-.69 1.38-1.09 2.26-1.09zm-83.43 102.84l35.11-44.02c.55-.69 1.38-1.09 2.26-1.09h105.98c2.33 0 3.71 2.61 2.39 4.54l-30.27 44.02c-.54.79-1.43 1.25-2.39 1.25h-110.82c-2.42 0-3.77-2.81-2.26-4.7zm246.24 4.7h8-124.7c-2.33 0-3.7-2.6-2.39-4.53l30-44.02a2.91 2.91 0 0 1 2.39-1.27h111.95c2.26 0 3.65 2.47 2.47 4.4zm33.25-57.11h-111.03c-2.33 0-3.7-2.6-2.39-4.53l30.42-44.64a2.91 2.91 0 0 1 2.39-1.27h107.86c2.26 0 3.65 2.47 2.47 4.4l-27.26 44.64c-.52.88-1.46 1.4-2.46 1.4zm35.24-57.73h-106.93c-2.33 0-3.7-2.6-2.39-4.53l26.25-38.53a2.91 2.91 0 0 1 2.39-1.27h104.21c3.01 0 3.9 1.36 2.47 4.4l-23.52 38.53c-.53.87-1.47 1.4-2.48 1.4z"
        fill={theme?.colors?.primaryLight}
      />
      <path
        d="M377.661 328.059l.53 39.63s4.08-1.01 7.48-8.29l95.85-166.43v-24.3c.26-4.13-2.92-5.95-2.92-5.95z"
        fill={theme?.colors?.primaryShadow}
      />
    </svg>
  );
};

export const MapPin = (props: { style?: {}; color?: string }) => {
  return (
    <svg
      style={props.style}
      aria-hidden="true"
      viewBox="0 0 24 24"
      data-testid="LocationOnIcon"
      fill={props.color ?? "black"}
      height="30"
      width="30"
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
        fill="currentColor"
      ></path>
    </svg>
  );
};
export const DownArrow = ({
  size,
  color,
}: {
  size?: number;
  color?: string;
}) => {
  return (
    <svg
      fill="none"
      height="14"
      viewBox="0 0 24 24"
      width="14"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.9188 8.17969H11.6888H6.07877C5.11877 8.17969 4.63877 9.33969 5.31877 10.0197L10.4988 15.1997C11.3288 16.0297 12.6788 16.0297 13.5088 15.1997L15.4788 13.2297L18.6888 10.0197C19.3588 9.33969 18.8788 8.17969 17.9188 8.17969Z"
        fill="currentColor"
      ></path>
    </svg>
  );
};

