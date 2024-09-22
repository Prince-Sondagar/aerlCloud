/*
Authors: Liam Kinne, Tom Day, Milan Koladiya, Peter Watkinson
Date: 15/01/2024
Description: This file contains the main components and JSX for the primary
  dashboard. Warning: code quality here is terrible, needs a rewrite.

Components:
- Location Dropdown: Allows users to select a location (e.g., site or organization) from a dropdown menu.
- Hub Dropdown: Enables the selection of specific gateways (hubs) associated with the chosen location.
- Device Dropdown: Allows users to choose a specific device for data visualization.
- Time Selection Dropdown: Offers options to select a time range for data visualization, such as today, yesterday, or custom time ranges.
- FullScreenToggle: Provides a button for toggling fullscreen mode.

State Hooks:
- time: Manages the selected time range for data visualization.
- location: Stores the currently selected location.
- timezone: Tracks the current timezone based on the selected location's coordinates.
- selectedHubs: Manages the set of selected hubs (gateways) for data filtering.
- device: Stores the currently selected device for data visualization.

Effects and Callbacks:
- useEffect: Handles updates to the time range based on changes in timezone.
- useMemo: Recalculates the timezone when the selected location changes.
- useCallback: Periodically updates the time state.
- useEffect (interval): Sets up a periodic update to refresh data.

Local Storage:
- The code uses local storage to persist user settings, such as selected location and time range.
*/

// Importing necessary hooks and components from React, Next.js, and other libraries.
import { Key, useCallback, useEffect, useMemo, useState } from "react";
import { GetServerSidePropsContext } from "next";
import { ReactFlowProvider } from "reactflow";
// Utility for timezone lookup.
import tz_lookup from "@photostructure/tz-lookup";
// Feather icons for UI elements.
import { MapPin, Server, Grid as DeviceIcon, Clock } from "react-feather";
// Helper for Supabase client creation.
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
// UI components from NextUI.
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Spacer } from "@nextui-org/react";
// API service for Prometheus.
import { prometheus } from "@/api/prometheus";
// Main layout component.
import Layout from "@/components/layouts/main";
// Component for rendering charts.
import Chart, { DataPoint } from "@/components/vis/chart";
// Fullscreen toggle component.
import FullScreenToggle from "@/components/vis/fullscreen";
// Component for displaying total values.
import Total from "@/components/vis/total";
// Component for displaying generated kWh values.
import GenKWH from "@/components/vis/genkwh";
// Component for displaying consumed kWh values.
import ConKWH from "@/components/vis/conkwh";
// Utility function for serial number to model conversion.
import serialToModel from "@/util/serial_to_model";
// Utility for time option management.
import getTimeOptions, { timeOptions } from "@/util/time_options";
// System overview visualization component.
import SystemOverview from "@/components/vis/system_overview";
// Provider for time context.
import TimeContextProvider from "@/components/vis/time_context";
// Utilities for local storage management.
import { getHubStatus, getLocalStorageData, setLocalStorageData } from "../util";
// Utilities for timezone and coordinates.
import { defaultTimezone, locationTimezone, parseCoordinates } from "@/util/location_timezone";
import { DownArrow } from "../components/icons";
import calculatePowerPlusSOC from "@/util/calculate_powerplus_soc";


// Type definitions for devices and locations.
interface Device { hub_id: string, tag: string, last_seen: Date };
type Location = {
  id: number;
  name: string;
  coordinate: string;
  devices: Device[];
  org_id: number | null;
};
interface hubsWithStatus extends Device {
  status: "online" | "offline"
}

type storedLocation = {
  locationId: number;
  LocationName: string;
  org_id: number;
};
// Server-side data fetching for initial props in Next.js.
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createPagesServerClient(ctx);
  try {
    // Fetching location data from the database.
    let { data: location, error } = await supabase
      .from("location")
      .select("id,name,org_id,coordinate,devices:gateways(hub_id,tag,last_seen)")
      .order("name");

    // Default fallback if no locations are found.
    if (!location || !location.length) {
      const response = await supabase
        .from("gateways")
        .select("hub_id,tag,last_seen")
        .order("hub_id");

      error = error || response.error;
      location = [
        {
          id: -1,
          name: "No Locations",
          coordinate: null,
          devices: response.data || [],
          org_id: null,
        },
      ];
    }

    // Server-side error handling and response
    if (error) throw error; // If there's an error fetching data, throw the error.

    // Returning the fetched location data as props for the component.
    return { props: { locations: location } };
  } catch (error) {
    console.error(error);
    return { props: { locations: [] } };
  }
};

// Definition of the Home component with locations passed as props.
export default function Home({ locations }: { locations: Location[] }) {
  // State for managing time options.
  const [time, setTime] = useState(getTimeOptions("today"));
  // State to store the current selected location.
  const [location, setLocation] = useState<number | null>(null);
  // State for the current timezone, initialized with a default value.
  const [timezone, setTimezone] = useState<string>(defaultTimezone());
  const [syncId, setSyncId] = useState<number>(5);
  // State to manage the set of selected hubs.
  const [selectedHubs, setSelectedHubs] = useState<Set<string>>(
    new Set(
      // Initializing with the hub IDs from the first location's devices.
      []
    ),
  );
  // State to store the current selected device.
  const [device, setDevice] = useState<string>("all");
  // Additional state to store the fetched data.
  const [batteryData, setBatteryData] = useState({ type: 'null', socQuery: 'null', voltageQuery: 'null' });
  const [inverterData, setInverterData] = useState({ type: 'null', powerQuery: 'null' });
  const [refetch, setRefetch] = useState(false);
  const [oldLocation, setOldLocation] = useState<number | null>(null);

  // Disabled Timezone implementation on the Dashboard until we come up with a better approach of handling it.

  /*
// Effect hook for updating the time based on changes in timezone.
useEffect(() => {
// Retrieve the time setting from local storage.
const uid = localStorage?.getItem("dashboard-time");
// Get new time options based on the stored setting or default to "today".
const newTime = getTimeOptions(uid ?? "today", timezone);
setTime(newTime); // Update the time state.
}, [timezone]);

// Memo hook to recalculate the timezone when the selected location changes.
useMemo(() => {
//var selectedLocation = locations?.find((d) => d.id == location) ?? null; // Find the selected location from the locations array.
//const coords: [number, number] | null = parseCoordinates(selectedLocation?.coordinate as string); // Parse the coordinates of the selected location.

const locationTimezone = defaultTimezone();//coords ? tz_lookup(...coords) : defaultTimezone(); // Determine the timezone based on coordinates or use the default.
setTimezone(locationTimezone as string); // Update the timezone state.
}, [location, locations]);
*/

  useEffect(() => {
    // This effect runs only once on component mount
    const defaultTime = getTimeOptions("today");
    // Update the time state, just in case it needs to be reinitialized
    setTime(defaultTime);
    // Set the local storage to the default time's UID
    localStorage.setItem("dashboard-time", defaultTime.uid);
  }, []);

  // Callback hook for periodically updating the time state.
  const update = useCallback(() => {
    try {
      const uid = localStorage?.getItem("dashboard-time"); // Retrieve the time setting from local storage.

      const newTime = getTimeOptions(uid ?? "today", timezone); // Get new time options based on the stored setting.
      if (!newTime) return; // If no new time options are available, exit early.

      // Check if the start or end time has changed and update the state if so.
      if (time.end != newTime.end || time.start != newTime.start) {
        setTime(newTime);
      }
    } catch (error) {
      console.error(error); // Log any errors encountered during the update process.
    }
  }, [time.start, time.end]); // Dependencies for the useCallback hook.

  // useEffect hook for setting up a periodic update.
  useEffect(() => {
    // Creating an interval that triggers the 'update' function every 30 seconds.
    const interval = setInterval(update, 30_000);

    // Cleanup function: Clears the interval when the component unmounts or dependencies change.
    return () => clearInterval(interval);
  }, [update]); // 'update' function as a dependency.

  // Constructing a label query string for data fetching.
  let labelQuery = `hub=~"${[...selectedHubs].join("|")}"`; // Combining all selected hubs into a query string.

  // Conditionally append to the query to filter by a specific device, if one is selected.
  if (device != "all") labelQuery += `,serial_number=~"${device}"`;

  // Determine if we have a comms or standalone battery. Hacky approach until we have something better.
  useEffect(() => {
    const fetchData = async () => {
      // Attempt to fetch Pylontech battery data first
      const pylontechResponse = await prometheus.query(`pylontech_battery_lv_soc_soh_soc{${labelQuery}}`);
      if (!pylontechResponse.error && pylontechResponse.data.result.length > 0) {
        setBatteryData({
          type: 'pylontech',
          socQuery: 'pylontech_battery_lv_soc_soh_soc',
          voltageQuery: 'pylontech_battery_lv_actual_values_voltage'
        });
      }

      // Check for Ampcontrol PLC data.
      const plcResponse = await prometheus.query(`ampcontrol_custom_plc_battery_inverter_ac_load_power{${labelQuery}}`);
      if (!plcResponse.error && plcResponse.data.result.length > 0) {
        setInverterData({
          type: 'ac_plc',
          powerQuery: 'ampcontrol_custom_plc_battery_inverter_ac_load_power'
        });
      }

      // If Pylontech battery data not found, attempt to fetch Inview X battery data
      const inviewResponse = await prometheus.query(`cet_inview_x_battery_autonomy_soc{${labelQuery}}`);
      if (!inviewResponse.error && inviewResponse.data.result.length > 0) {
        setBatteryData({
          type: 'inview_x',
          socQuery: 'cet_inview_x_dc_voltage', // Note: Inview does not report accurate SOC, so use the voltage
          voltageQuery: 'cet_inview_x_dc_voltage'
        });
        setInverterData({
          type: 'inview_x',
          powerQuery: 'cet_inview_x_ac_output_global_apparent_power'
        });
      }
    };
    if (selectedHubs.size > 0) {
      fetchData();
    }
  }, [labelQuery]);

  const syncMethodFunction = (_tooltipTicks: [], data: any, dataPoints: DataPoint[]) => {
    return dataPoints?.findIndex((datas: DataPoint) => datas.time === data?.activePayload?.[0]?.payload?.time);
  };

  // refetch the data on the chart and totalCard when location change
  useEffect(() => {
    setOldLocation(location);
    if (location !== oldLocation && oldLocation !== null) {
      setRefetch(true);
    }
  }, [location]);


  // Return statement of the component rendering the UI.
  return (
    <Layout>
      <div className="flex justify-between sm:mt-10 mt-9 mb-7 sm:mx-2 mx-1">
        <div className="flex flex-wrap gap-y-3.5">
          <LocationDropdown
            locations={locations}
            onAction={(id) => {
              setLocation(id as number);
            }}
          />
          <HubDropdown
            hubs={locations?.find((d) => d.id == location)?.devices ?? []}
            selected={selectedHubs}
            setSelected={setSelectedHubs}
          />
          <DeviceDropdown
            hubs={selectedHubs}
            time={time}
            onAction={(serial) => setDevice(serial)}
          />
          <Dropdown className="bg-backgroundContrast border-border border note-icon">
            <DropdownTrigger>
              <Button className="gap-1.5 bg-primaryLight hover:bg-primaryLightHover text-primaryLightContrast font-medium px-5 disabled:bg-backgroundHover disabled:text-secondaryText opacity-100">
                <Clock />
                {time.name}
                <DownArrow />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              className="bg-backgroundContrast w-60"
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={new Set([0])}
              onAction={(key) => {
                const newTime = getTimeOptions(key as string, timezone);

                if (newTime) {
                  if (window)
                    localStorage.setItem("dashboard-time", newTime.uid);
                  setTime(newTime);
                }
              }}
            >
              {timeOptions.map(({ uid, name }) => {
                return (
                  <DropdownItem
                    key={uid}
                    className="dropdown hover:!bg-backgroundHover focus:!bg-backgroundHover hover:!text-blackHover text-textColor focus:!text-blackHover py-2 px-3 duration-500"
                  >
                    <span className="text-base">{name}</span>
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </Dropdown>
        </div>
        <FullScreenToggle />
      </div>
      <TimeContextProvider
        value={{ start: time.start / 1000, end: time.end / 1000, uid: time.uid }}
      >
        <div className="xl:flex">
          <GenKWH
            measurement={"Power Generated"}
            labelQuery={labelQuery}
            unit={"Wh"}
            selectedHubs={selectedHubs}
            refetch={refetch}
          />
          <Total
            measurement={"PV Power"}
            query={`sum(aerl_srx_pv_voltage{${labelQuery}} * aerl_srx_pv_current)`}
            unit={"W"}
            selectedHubs={selectedHubs}
            refetch={refetch}
          />
          <Total
            measurement={"AC Power"}
            query={inverterData.type === "inview_x" ? `avg(${inverterData.powerQuery}{${labelQuery}}) * 1` : `avg(${inverterData.powerQuery}{${labelQuery}}) * 1000`}
            unit={"W"}
            selectedHubs={selectedHubs}
            refetch={refetch}
          />
          <ConKWH
            measurement={"Power Consumed"}
            query={inverterData.type === "inview_x" ? `avg(${inverterData.powerQuery}{${labelQuery}}) * 1` : `avg(${inverterData.powerQuery}{${labelQuery}}) * 1000`}
            unit={"Wh"}
            selectedHubs={selectedHubs}
            refetch={refetch}
          />
        </div>
        <div>
          <ReactFlowProvider>
            <SystemOverview labelQuery={labelQuery} socQuery={batteryData.socQuery} batType={batteryData.type} powerQuery={inverterData.powerQuery} invType={inverterData.type} />
          </ReactFlowProvider>
        </div>
        <div className="lg:mt-7 mt-6 mb-5">
          <div className="grid md:grid-cols-2 grid-cols-1">
            <Chart
              syncId={syncId}
              aspect={8 / 1}
              title="PV Power"
              unit="W"
              extents={["peak", "avg"]}
              syncMethodFunction={syncMethodFunction}
              metric={`sum(aerl_srx_pv_voltage{${labelQuery}} * aerl_srx_pv_current) < 1000000`}
              timezone={timezone}
              selectedHubs={selectedHubs}
              refetch={refetch}
            />
            <Chart
              syncId={syncId}
              aspect={8 / 1}
              title="AC Power"
              unit="W"
              extents={["peak", "avg"]}
              syncMethodFunction={syncMethodFunction}
              metric={inverterData.type === "inview_x" ? `avg(${inverterData.powerQuery}{${labelQuery}}) * 1` : `avg(${inverterData.powerQuery}{${labelQuery}}) * 1000`}
              timezone={timezone}
              selectedHubs={selectedHubs}
              refetch={refetch}
            />
          </div >
          <div className="grid md:grid-cols-2 grid-cols-1">
            <Chart
              syncId={syncId}
              aspect={8 / 1}
              title={"Battery SOC"}
              unit={"%"}
              extents={["max", "min"]}
              syncMethodFunction={syncMethodFunction}
              metric={`avg(${batteryData.socQuery}{${labelQuery}}) < 100000`}
              transform={batteryData.type === "inview_x" ? calculatePowerPlusSOC : undefined}
              timezone={timezone}
              selectedHubs={selectedHubs}
              refetch={refetch}
            />
            <Chart
              syncId={syncId}
              aspect={8 / 1}
              title="Battery Voltage"
              unit="V"
              extents={["max", "min"]}
              syncMethodFunction={syncMethodFunction}
              metric={batteryData.type != 'null' ?
                `avg(${batteryData.voltageQuery}{${labelQuery}}) < 100000` :
                `avg(aerl_srx_output_voltage{${labelQuery}}) < 100000`}
              timezone={timezone}
              selectedHubs={selectedHubs}
              refetch={refetch}
            />
          </div>
        </div >
      </TimeContextProvider >
    </Layout >
  );
}

/**
 * LocationDropdown Component
 *
 * This component represents a dropdown menu for selecting a location (e.g., site or organization) within the dashboard.
 *
 * Props:
 * - locations: An array of Location objects, each containing information about a specific location.
 * - onAction: A callback function to handle actions when a location is selected.
 *
 * State Hooks:
 * - selection: Stores the currently selected location.
 *
 * Local Storage Management:
 * - The component uses local storage to persist selected location data.
 *
 * Functions:
 * - changeSelection: A function that handles changes in location selection. It updates the selected location, manages local storage for location data, and triggers the onAction callback.
 * - truncate: A helper function to truncate a string to a specified length, adding an ellipsis if it's longer.
 *
 * useEffect Hook:
 * - The 'useEffect' hook is used to fetch and set location data when the component mounts or when dependencies change. It retrieves stored location data from local storage and initializes the component's state based on that data or defaults to the first location if no data is found.
 *
 * This component plays a crucial role in allowing users to select a location from a list of available options, which can impact data filtering and visualization within the dashboard.
 */

function LocationDropdown({
  locations,
  onAction,
}: {
  locations: Location[]; // Array of Location objects.
  onAction: (key: Key) => void; // Function to handle action when a location is selected.
}) {
  // State to track the current selection.
  const [selection, setSelection] = useState<string>("");
  // Extracting the organization ID from the first location, if available.
  const OrgId = locations.find((location) => location)?.org_id;

  // Function to handle changes in selection.
  const changeSelection = async (key: Key) => {
    // Find the ID of the location matching the selected key.
    const keyId = locations.find((d) => d?.name?.trim() == key)?.id;
    let updatedLocation = [];
    if (keyId) {
      // Retrieve stored locations from local storage.
      const org_Location: storedLocation[] = await JSON.parse(
        getLocalStorageData("org_location") ?? "[]"
      );

      // Check if the organization exists in the stored data.
      const isOrgExist = org_Location.find(
        (org: storedLocation) => org.org_id === OrgId
      );

      // Update the location data based on whether the organization already exists.
      if (isOrgExist) {
        updatedLocation = org_Location.map((item: storedLocation) =>
          item.org_id === OrgId
            ? {
              locationId: keyId,
              LocationName: key || "",
              org_id: isOrgExist.org_id,
            }
            : item
        );
      } else {
        updatedLocation = [
          ...(org_Location || []),
          { locationId: keyId, LocationName: key, org_id: OrgId },
        ];
      }

      // Update the local storage with the new location data.
      setLocalStorageData("org_location", JSON.stringify(updatedLocation));
      // Update the selection state and trigger the onAction callback.
      setSelection(key as string);
      onAction(keyId);
    }
  };

  // Function to truncate a string to a specified length, adding an ellipsis if it's longer.
  const truncate = (str: string, n: number) => {
    return str.length > n ? str.slice(0, n - 1) + "…" : str;
  };

  // useEffect hook to fetch and set location data when the component mounts or dependencies change.
  useEffect(() => {
    // Async function to fetch location data from local storage.
    const fetchLocationData = async () => {
      // Retrieve 'storedLocation' array from local storage, or default to an empty array if not found.
      const storedLocation: storedLocation[] = await JSON.parse(
        getLocalStorageData("org_location") ?? "[]"
      );
      // Find the current organization's location data in the stored locations.
      const currentOrgLocationData = storedLocation.find(
        (location: storedLocation) => location.org_id === OrgId
      );
      // If data for the current organization exists, use it to set the dropdown selection and trigger action.
      if (currentOrgLocationData) {
        // Find the location data corresponding to the stored location ID.
        const locationData = locations.find(
          (d) => d.id === currentOrgLocationData?.locationId
        );
        // Set the selection to the found location's name. Default to the first location's name if not found.
        setSelection(locationData?.name ?? locations[0]?.name ?? "");
        // Trigger the action (like updating state or context) with the found location ID.
        onAction(locationData?.id as number);
      } else {
        // If no stored data for the current organization, default to the first location.
        setSelection(locations[0]?.name ?? "");
        onAction(locations?.[0]?.id)
      }
    };
    // Execute the fetchLocationData function.
    fetchLocationData();
  }, [OrgId, locations, selection]);



  return (
    <Dropdown className="bg-backgroundContrast border-border border text-textColor p-1 relative top-1 left-3 note-icon">
      <DropdownTrigger>
        <Button
          isDisabled={locations.length <= 1}
          className="bg-primaryLight me-2.5 gap-1.5 px-5 truncate hover:!bg-primaryLightHover text-primaryLightContrast font-medium  disabled:bg-backgroundHover disabled:text-secondaryText opacity-100"
        >
          <MapPin />
          {locations.find((d) => d.name == selection)?.name ?? "No Gateways"}
          <DownArrow />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        className="bg-backgroundContrast w-[250px]"
        selectionMode="single"
        selectedKeys={selection ? new Set([selection.trim()]) : undefined}
        onAction={changeSelection}
      >
        <DropdownSection title="Location">
          {locations.map((location: any) => (
            <DropdownItem
              className="dropdown hover:!bg-backgroundHover hover:!text-blackHover focus:!text-blackHover focus:!bg-backgroundHover text-textColor py-1 px-3 duration-500"
              key={location.name}
              description={`${location.devices.length} gateway${location.devices.length > 1 ? "s" : ""
                }`}
            >
              <span className="text-base">
                {" "}
                {truncate(location.name ?? "", 30)}
              </span>
            </DropdownItem>
          ))}
        </DropdownSection>
      </DropdownMenu>
    </Dropdown >
  );
}

/**
 * HubDropdown Component
 *
 * This component represents a dropdown menu for selecting hub (gateways) devices within the dashboard.
 *
 * Props:
 * - hubs: An array of hub devices, each containing information about a specific hub.
 * - selected: Currently selected hubs. 'any' type is used due to typing issues with NextUI.
 * - setSelected: Function to set the selected hubs.
 *
 * Functions:
 * - useEffect Hook: This hook is used to update the selected hubs when the 'hubs' array changes. It sets the selected hubs to all hubs when the list of hubs changes, typically when the location changes.
 * - truncate: A helper function to truncate a string to a specified length, adding an ellipsis if it's too long.
 *
 * This component plays a crucial role in allowing users to select hub devices from a list of available options, which can impact data filtering and visualization within the dashboard.
 */

function HubDropdown({
  hubs,
  selected,
  setSelected,
}: {
  hubs: Device[]; // Array of hub devices.
  selected: any; // Currently selected hubs. 'any' type is used due to typing issues with NextUI.
  setSelected: any; // Function to set the selected hubs.
}) {

  // useEffect hook to update the selected hubs when the hubs array changes.
  useEffect(() => {
    const onlineHubs = hubs.filter((hub) => getHubStatus(hub?.last_seen) === "online");

    if (onlineHubs.length > 0) {
      setSelected(
        new Set(onlineHubs.map((h) => h.hub_id)) // Map each hub to its hub_id and create a Set of these ids.
      );
    } else {
      const offlineHubs = hubs.filter((hub) => hub.last_seen !== null);
      if (offlineHubs.length > 0) {
        const getOfflineLastSeenHubs = offlineHubs.reduce((prev, current) => (
          new Date(prev?.last_seen) > new Date(current?.last_seen) ? prev : current
        ));
        setSelected(new Set([getOfflineLastSeenHubs?.hub_id]));
      } else {
        setSelected(new Set(hubs[0]?.hub_id ?? []));
      }
    }
  }, [hubs]); // Dependency array includes the 'hubs' array.

  // Function to truncate a string to a specified length with an ellipsis if it's too long.
  const truncate = (str: string, n: number) => {
    // If the string length is greater than 'n', truncate and append an ellipsis.
    return str.length > n ? str.slice(0, n - 1) + "…" : str;
  };

  return (
    <Dropdown className="bg-backgroundContrast border-border border note-icon">
      <DropdownTrigger>
        <Button
          isDisabled={hubs.length == 0}
          className="bg-primaryLight sm:mt-0 sm:me-2.5 me-2 gap-1.5 truncate hover:bg-primaryLightHover text-primaryLightContrast font-medium px-5 disabled:bg-backgroundHover disabled:text-secondaryText opacity-100"
        >
          <Server />
          {selected.size == hubs.length ? "All Gateways" : "Select Gateways"}
          <DownArrow />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        className="w-[250px]"
        aria-label="Gateways"
        disallowEmptySelection
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectionChange={setSelected}
      >
        <DropdownSection title="Gateway" className="mb-0 pt-1">
          {hubs.map((device: any) => (
            <DropdownItem
              key={device.hub_id}
              description={device.hub_id}
              className="dropdown hover:!bg-backgroundHover hover:!text-blackHover focus:!text-blackHover focus:!bg-backgroundHover text-textColor duration-500"
            >
              <span className="text-base">
                {truncate(device?.tag ?? "", 30)}
              </span>
            </DropdownItem>
          ))}
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}

/**
 * DeviceDropdown Component
 *
 * This component represents a dropdown menu for selecting a specific device for data visualization.
 *
 * Props:
 * - hubs: A set containing the unique identifiers (hub IDs) of available hubs (gateways).
 * - time: An optional object representing the selected time range for data visualization.
 * - onAction: An optional callback function to handle changes in device selection.
 *
 * State Hooks:
 * - devices: Stores a set of unique device identifiers retrieved from data.
 * - selection: Stores the currently selected device identifier.
 *
 * Functions:
 * - changeSelection: A function called when a device is selected. It updates the selected device and triggers the onAction callback if provided.
 *
 * Asynchronous Data Loading:
 * - The 'load' function is responsible for asynchronously loading device data based on the selected time range and available hubs (gateways). It uses the Prometheus API to fetch relevant data.
 *
 * useEffect Hook:
 * - The 'useEffect' hook is used to trigger the 'load' function whenever there are changes in the 'hubs' or 'time' props. It also resets the selected device to "all."
 *
 * deviceTitle Function:
 * - A helper function that generates the title to display in the dropdown based on the selected device. It dynamically changes the title to reflect the selected device or indicate "All Devices" or "No Devices" when appropriate.
 *
 * This component provides users with the ability to select a specific device or view data for all devices, enhancing the customization of data visualization.
 */

function DeviceDropdown({
  hubs,
  time,
  onAction,
}: {
  hubs: Set<string>;
  time?: any;
  onAction?: (key: string) => void;
}) {
  const [devices, setDevices] = useState<Set<string>>(new Set([]));
  const [selection, setSelection] = useState<string>("all");

  const changeSelection = (key: Key) => {
    const newSelection = key as string;
    setSelection(newSelection);
    // Callback: Invoke the provided 'onAction' function with the new selection.
    if (onAction) onAction(newSelection);
  };

  // Loads all seen devices within the selected time window (in seconds).
  let load = useCallback(async () => {
    const start = time.start
      ? time.start / 1000
      : new Date().getTime() / 1000 - 60 * 60 * 24;
    const end = time.end / 1000;

    // Fetch device data from Prometheus based on selected hubs (gateways).
    const result = await prometheus.series(
      [`aerl_srx_information_serial_number{hub=~"${[...hubs].join("|")}"}`],
      start,
      end,
    );

    // Extract serial numbers from the fetched data and store them in 'newDevices'.
    const newDevices = result.data?.map((r) => r.serial_number);

    // Update the 'devices' state with the set of unique device identifiers.
    setDevices(new Set(newDevices));
  }, [hubs, time]);

  // Update devices when 'hubs' or 'time' changes.
  useEffect(() => {
    if (hubs.size > 0 && time) {
      // Reset the selected device to "all" when hubs or time change.
      setSelection("all");
      // Trigger the 'load' function to fetch updated device data.
      load();
    } else {
      setDevices(new Set([]))
    }
  }, [hubs, time, load]);

  // Generate the title displayed in the dropdown menu based on the selected device.
  const deviceTitle = () => {
    if (selection == "all") {
      if (devices.size == 0) {
        return "No Devices";
      } else {
        return "All Devices";
      }
    } else {
      // Use a utility function to convert the selected device identifier to a more user-friendly representation.
      return serialToModel(selection);
    }
  };

  return (
    <Dropdown className="bg-backgroundContrast p-0 border-border border note-icon">
      <DropdownTrigger>
        <Button
          isDisabled={devices.size == 0}
          className="bg-primaryLight me-2.5 gap-1.5 truncate hover:bg-primaryLightHover text-primaryLightContrast font-medium px-5 disabled:bg-backgroundHover disabled:text-secondaryText opacity-100"
        >
          <DeviceIcon />
          {deviceTitle()}
          <DownArrow />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        className="w-[268px] max-h-[481px] overflow-hidden overflow-y-auto px-2"
        selectionMode="single"
        selectedKeys={new Set([selection])}
        onAction={changeSelection}
      >
        <DropdownSection
          title="Device"
          showDivider
          className="mb-0 border-b border-border"
        >
          <DropdownItem
            key="all"
            className="hover:!bg-backgroundHover focus:!bg-backgroundHover hover:!text-blackHover text-textColor focus:!text-blackHover text-base px-3 py-2"
          >
            All Devices
          </DropdownItem>
        </DropdownSection>
        <DropdownSection className="mb-0">
          {[...devices].map((device) => (
            <DropdownItem
              className="dropdown hover:!bg-backgroundHover focus:!bg-backgroundHover hover:!text-blackHover focus:!text-blackHover text-textColor px-3 duration-500"
              key={device}
              description={device}
            >
              <span className="text-base hover:text-backgroundMenu focus:text-backgroundMenu">
                {serialToModel(device)}
              </span>
            </DropdownItem>
          ))}
        </DropdownSection>
      </DropdownMenu>
    </Dropdown >
  );
}
