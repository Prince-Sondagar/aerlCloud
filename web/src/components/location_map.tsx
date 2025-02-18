import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";
import { LatLngBoundsExpression, Map, divIcon, latLngBounds } from "leaflet";
import { Card, Spacer, } from "@nextui-org/react";
import { Position } from "./location_selector";
import { Database } from "@/supabase/types";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { Circle, MapPin } from "./icons";
import { getThemes } from "../util";

type Device = Database["public"]["Tables"]["location"]["Row"];
type DeviceLocation = {
  device: any;
  location: Position;
};

export default function LocationMap(props: { devices: Array<Device> }) {
  const position = { lat: -28.553999263375886, lng: 147.04041614677712 };
  const zoom = 4;

  // Calculate bounding box for all devices
  const deviceLocations = props.devices.map((device: Device) => {
    return {
      device: device,
      location: parseCoordinates((device.coordinate as string) ?? ""),
    } as DeviceLocation;
  });

  // Move initial map viewbox to center on all points
  const mapRef = createRef<Map>();

  const fitMapToMarkers = () => {
    // Keep polling until map defined
    if (!mapRef || !mapRef.current) {
      setTimeout(fitMapToMarkers, 500);
      return;
    }

    const bounds = calculateBounds(
      deviceLocations.map((device) => device.location),
    );
    const boundsExpression: LatLngBoundsExpression =
      bounds as LatLngBoundsExpression;
    mapRef.current?.fitBounds(boundsExpression);
  };

  useEffect(fitMapToMarkers, [mapRef, deviceLocations, fitMapToMarkers]);

  return (
    <Card className="border border-border bg-backgroundContrast">
      <MapContainer
        ref={mapRef}
        center={position}
        minZoom={3}
        style={{ height: "40vh", borderRadius: "1em", padding: '10%' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomleft" />
        <TileLayer
          attribution='Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains={"abcd"}
        />
        <ChangeView newPosition={position} zoomLevel={zoom} />
        {deviceLocations.map((device, index) => {
          return <DeviceMarker device={device} key={index} />;
        })}
      </MapContainer>
    </Card>
  );
}

const DeviceMarker = (props: { device: DeviceLocation }) => {
  const date = new Date(props.device.device.last_seen ?? "");
  const now = new Date();

  const { theme } = getThemes();

  const diff = (now.getTime() - date.getTime()) / 1000;
  const isOnline = diff <= 60;

  // Create a custom icon
  const customIcon = divIcon({
    className: "custom-icon",
    html: renderToString(
      <MapPin
        style={{ width: "60px", height: "60px" }}
        color={isOnline ? theme?.colors.primary : "gray"}
      />,
    ),
    iconSize: [60, 60], // Size of the icon
  });

  return (
    <>
      <Marker icon={customIcon} position={[51.505, -0.09]}>
        <Popup>
          <div>
            <h4 className="pb-0 text-black">
              {props.device.device.name}
            </h4>
            <p className="m-0 text-black">
              {formatDate("2023-12-06T04:56:39.917+00:00")}
            </p>
          </div>
        </Popup>
      </Marker>
    </>
  );
};

const ChangeView = (props: { newPosition: Position; zoomLevel: number }) => {
  const map = useMap();
  map.setView(props.newPosition, props.zoomLevel, { animate: true });
  return null;
};

const calculateBounds = (positions: Position[]) => {
  // Filter out null values
  const validPositions = positions.filter(
    (position) => position.lat !== 0 && position.lng !== 0,
  );
  if (validPositions.length === 0)
    return [
      [-10.916528228054695, 106.9644435518514],
      [-45.30006135349591, 158.5015695404282],
    ];

  // Calculate bounding box
  const latitudes = validPositions.map((position) => position.lat);
  const longitudes = validPositions.map((position) => position.lng);
  const minLatitude = Math.min(...latitudes) * 0.95;
  const maxLatitude = Math.max(...latitudes) * 1.05;
  const minLongitude = Math.min(...longitudes) * 0.99;
  const maxLongitude = Math.max(...longitudes) * 1.01;

  // Return latlng bounds
  return latLngBounds([
    [minLatitude, minLongitude],
    [maxLatitude, maxLongitude],
  ]) as LatLngBoundsExpression;
};

// Return a Position type
const parseCoordinates = (coords: string) => {
  // Handle empty coordinates
  if (coords === "") return { lat: 0, lng: 0 } as Position;

  const regex = /\((-?\d+\.\d+),(-?\d+\.\d+)\)/;
  const matches = coords.match(regex);

  // Handle invalid coordinates
  if (!matches) return { lat: 0, lng: 0 } as Position;

  const latitude = parseFloat(matches[1]);
  const longitude = parseFloat(matches[2]);
  return { lat: latitude, lng: longitude } as Position;
};

function formatDate(input: string | null) {
  if (!input) {
    return <p color="black">Did you forget to plug it in?</p>;
  }

  const date = new Date(input);
  const now = new Date();

  const diff = (now.getTime() - date.getTime()) / 1000;

  if (diff <= 60) {
    return (
      <div className="flex items-center justify-center">
        <Circle size={8} color="#13A452" />
        <Spacer x={0} />
        <span color="black">Connected</span>
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
    <div className="flex items-center justify-center">
      <Circle size={8} color="#687076" />
      <Spacer x={1} />
      <span className="text-black">Last seen {formatted}</span>
    </div>
  );
}
