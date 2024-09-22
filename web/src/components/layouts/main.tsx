import { Spacer } from "@nextui-org/react";
import Navbar from "./navbar";
import Links from "./links";
import { useContext } from "react";
import { FullScreenContext } from "../vis/fullscreen";

export type LayoutProps = {
  children: React.ReactNode;
  hideNav?: boolean;
  titleSuffix?: string;
};

export default function Main(props: LayoutProps) {
  const isFullscreen = useContext(FullScreenContext);

  return (
    <div className="min-h-screen flex flex-col">
      {!props.hideNav && <Navbar />}
      <main className="grow px-1">
        <div className={`${isFullscreen ? "mx-3" : "container mx-auto"}`}>
          <Spacer y={2} />
          {props.children}
        </div>
      </main>
      {!props.hideNav && (
        <footer>
          <div className={isFullscreen ? "mx-3" : "container mx-auto px-6 mb-5"}>
            <Links />
          </div>
        </footer>
      )}
    </div>
  );
}
