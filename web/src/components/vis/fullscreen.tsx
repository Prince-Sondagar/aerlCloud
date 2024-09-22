import { Button, Tooltip } from "@nextui-org/react";
import { createContext, useContext, useEffect, useState } from "react";
import { BarChart2 } from "react-feather";

//context for fullscreen 
export const FullScreenContext = createContext(false);

// useFullscreenToggle function for switch the fullscreen mode
export function useFullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      setIsFullscreen(false);
      document.exitFullscreen();
    } else {
      setIsFullscreen(true);
      document.body.requestFullscreen({ navigationUI: "hide" });
    }
  };

  return { isFullscreen, toggleFullscreen };
}

// for fullscreen toggle button 
export default function FullScreenToggle() {
  const { toggleFullscreen } = useFullscreenToggle();

  return (
    <Tooltip
      content="Go full-screen"
      placement="bottom"
      className="bg-backgroundContrast text-textColor border-0"
    >
      <Button
        className="full-toggle flex min-w-11 bg-primaryLight text-primaryLightContrast p-0"
        color="primary"
        onPress={() => toggleFullscreen()}
      >
        <BarChart2 />
      </Button>
    </Tooltip>
  );
}

// provider of the FullScreenContext for providing the value and manage the fullscreen display accordingly 
export function FullScreenProvider({ children }: any) {
  const [isFullScreens, setIsFullScreens] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreens(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <FullScreenContext.Provider value={isFullScreens}>
      {children}
    </FullScreenContext.Provider>
  );
}