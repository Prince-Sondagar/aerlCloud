import tzlookup from "@photostructure/tz-lookup";

type Device = { hub_id: string; name: string; coordinate: string | null };

// Function to retrieve a location's timezone or the browser's default timezone if unavailable
export const locationTimezone = (devices: Device[] | null): string => {
  if (!devices) {
    return defaultTimezone();
  }

  const coords = getFirstValidCoordinates(devices);
  if (!coords) {
    return defaultTimezone();
  }

  return tzlookup(...coords);
};

export const parseCoordinates = (
  coordinateString: string,
): [number, number] | null => {
  const coordinateRegex =
    /^\s*\(\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*\)\s*$/;
  const match = coordinateRegex.exec(coordinateString);

  if (match && match.length === 3) {
    const latitude = parseFloat(match[1]);
    const longitude = parseFloat(match[2]);
    return [latitude, longitude];
  }

  return null;
};

// Helper function to find and parse the first valid coordinate string
const getFirstValidCoordinates = (
  devices: Device[],
): [number, number] | null => {
  for (const device of devices) {
    if (device.coordinate) {
      const parsedCoords = parseCoordinates(device.coordinate);
      if (parsedCoords) {
        return parsedCoords;
      }
    }
  }
  return null;
};

// Helper function to get the browser's default timezone
export const defaultTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};
