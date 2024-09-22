import { Button, Tooltip } from "@nextui-org/react";
import { Copy } from "./icons";
import { useEffect, useState } from "react";
import { getThemes } from "../util";

const CopyButton = ({ text, copyText, icon }: { text: string, copyText?: string, icon?: boolean }) => {
  const [copied, setCopying] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  var copyTimeout: NodeJS.Timeout;
  const clipboardText: string = copyText ?? text;
  icon = icon ?? true;

  const handleCopy = () => {
    // Copy to clipboard
    if ('clipboard' in navigator) {
      navigator.clipboard.writeText(clipboardText);
    } else {
      // Legacy browsers
      document.execCommand('copy', true, clipboardText);
    }

    // Change text to copied
    setCopying(true);

    // Remove any existing copy timeout
    clearTimeout(copyTimeout);

    // create new copy timeout
    copyTimeout = (setTimeout(() => {
      setCopying(false);
    }, 2000));
  }

  useEffect(() => {
    if (copied) {
      // Delay hiding the tooltip after copying
      setTimeout(() => {
        setCopying(false);
      }, 3000); // Adjust the delay time as needed
    }
  }, [copied]);

  const { themeLabel } = getThemes();

  const onMouseLeaveHandle = () => {
    setIsOpen(false);
    setCopying(false)
  }

  return (
    <>
      {clipboardText && (
        <Tooltip
          isOpen={isOpen}
          showArrow
          placement="right"
          delay={250}
          onPointerLeave={() => {
            setTimeout(() => {
              setCopying(false)
            }, 300);
          }}
          content={copied ? "Copied!" : "Copy"}
          classNames={{
            base: [
              "before:bg-background",
            ],
            content: [
              "py-2 px-4 shadow-xl",
              "text-textColor rounded-full bg-background",
            ],
          }}
        >
          <Button onMouseMove={() => setIsOpen(true)} onMouseLeave={onMouseLeaveHandle} onClick={handleCopy} className="text-textColor">{clipboardText}</Button>
        </Tooltip>
      )}
    </>

  )
}

export default CopyButton;