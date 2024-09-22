import { Circle } from "@/components/icons";


export default function OnlineBadge({
  timestamp,
  hideText,
}: {
  timestamp: string | number | Date | null;
  hideText?: boolean;
}) {
  if (!timestamp) {
    if (!hideText) {
      return <span>Never</span>;
    } else {
      return <Circle size={8} color="#687076" />;
    }
  }

  const date = new Date(timestamp);
  const now = new Date();

  const diff = (now.getTime() - date.getTime()) / 1000;

  if (diff <= 60 * 5) {
    return (
      <div className="items-center flex gap-1.5">
        <Circle size={8} color="#13A452" />
        {!hideText && <>Connected</>}
      </div>
    );
  }

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const formatted = date.toLocaleString([], {
    month: isToday ? undefined : "short",
    day: isToday ? undefined : "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZoneName: "short",
  });

  return (
    <div className="items-center flex gap-1.5">
      <Circle size={8} color="#687076" />
      {!hideText && <>Last seen {formatted}</>}
    </div>
  );
}
