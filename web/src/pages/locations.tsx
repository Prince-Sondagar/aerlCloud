import { prometheus } from "@/api/prometheus";
import CommonTable, { CommonTableColumnProps } from "@/components/CommonTable";
import CopyButton from "@/components/copy_button";
import OnlineBadge from "@/components/online_badge";
import prettyPrintError from "@/util/pretty_print_error";
import serialToModel from "@/util/serial_to_model";
import { Card, CardBody, Spacer, Spinner } from "@nextui-org/react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { LayoutProps } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Layout from "@/components/layouts/main";
import { Search } from "react-feather";
import CommonInput from "../components/CommonInput";
import { prettyPrintFWVersion } from "../util/pretty_print_fw_version";
import { getHubStatus } from "../util";

interface Device {
  model: string;
  serial_no: string;
  location: string;
  last_seen?: number;
  status?: [number, string][];
  fw_version: string
}

interface Hub {
  devices: Device[];
  hub_id: string;
  tag: string | null;
  last_seen: string | null;
}

export const getServerSideProps = async () => {
  return {
    props: {},
  };
};

export default function Locations(props: LayoutProps) {
  const supabase = useSupabaseClient();
  const [search, setSearch] = useState("");
  const [hubs, setHubs] = useState<Hub[]>();
  const [loading, setLoading] = useState<boolean>(true);

  const searchDevices = (hub: Hub) => {
    // Empty query returns all devices
    if (search === "") {
      return true;
    }

    // Search for either location name or serial number
    return (
      hub.tag?.toLowerCase().includes(search.toLowerCase()) ||
      hub.devices.some((d) =>
        d.serial_no.toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  // Load the hubs in
  useEffect(() => {
    // Load all hubs in org
    const loadHubs = async () => {
      // Query hubs from supabase
      const { data } = await supabase
        .from("gateways")
        .select("hub_id, tag, last_seen")
        .order("tag");

      return data as Hub[];
    };

    let isCancelled = false; // Prevent memeory leak
    const load = async () => {
      setLoading(true);

      // Process:
      // 0. Load the hubs in (Supabase Query)
      // 1. Load the online devices for each hub (quick query)
      // 2. Load in the offline devices for each hub (slow query)

      // 0. Load the hubs in (Supabase Query)
      const hubs: Hub[] = await loadHubs();

      // Before proceeding, check if the component is unmounted (prevent memory leak)
      if (isCancelled) return;

      // Load all devices
      if (hubs.length <= 0) {
        setHubs([]);
        setLoading(false);
        return;
      }

      // Start should be 30 days ago
      const now = new Date();
      const startTime = now.getTime() / 1000 - 30 * 24 * 60 * 60;
      const endTime = now.getTime() / 1000;
      const timeStep = Math.max(1, Math.floor((endTime - startTime) / 10000));

      // Query last known device timestamp
      const result = await prometheus.queryRange(
        `max by (serial_number, hub) (timestamp(aerl_srx_information_serial_number{hub=~"${hubs
          .map((h) => h.hub_id)
          .join("|")}"}))`,
        startTime,
        endTime,
        timeStep
      );
      // Map to device objects
      const devices: Device[] = result.data?.result.map((r: any) => {
        return {
          serial_no: r.metric.serial_number,
          model: serialToModel(r.metric.serial_number),
          location: r.metric.hub,
          last_seen: parseInt(r.values.slice(-1)[0][1]) * 1000, // Convert to millisecond epoch timestamp for js
        };
      });

      const hubsWithDevices = hubs.map((h) => {
        return {
          ...h,
          devices: devices?.filter((d) => d.location === h.hub_id),
        };
      });

      if (isCancelled) return;
      setHubs(hubsWithDevices);
      setLoading(false);
    };
    load();

    return () => {
      isCancelled = true;
    };
  }, [supabase]);

  return (
    <Layout {...props} titleSuffix="Devices">
      <div className="mx-auto gap-0.5 px-1.5 mb-5">
        <Spacer y={4} />
        <div className="w-[283px] ml-auto mr-2">
          <CommonInput
            type="text"
            label={<></>}
            placeholder="Search"
            onChange={(e) => setSearch(e.target.value)}
            endContent={<Search className="text-xs h-4 pointer-events-none" />}
          />
        </div>
        {!loading ? (
          !hubs?.length ? (
            <Card className="border border-border bg-backgroundContrast mt-10">
              <CardBody className="px-6">
                <h2 className="text-textColor">No devices found.</h2>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-10 mt-5">
              {hubs?.map(
                (location) =>
                  searchDevices(location) && (
                    <>
                      <LocationCard
                        key={location.tag}
                        location={location}
                        loading={loading}
                      />
                    </>
                  )
              )}
            </div>
          )
        ) : (
          <>
            <div className="absolute left-1/2 top-1/2">
              <Spinner color="secondary" />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

type BatteryState = {
  batteryConnected: boolean;
  batterySOC: string;
  batterySOH: string;
  batteryVoltage: string;
  batteryFault: boolean;
};

const LocationCard = (props: { location: Hub; loading: boolean }) => {
  const [isLoading, setIsLoading] = useState({
    fw_versionResult: false,
    status: false,
  });
  const router = useRouter();
  // Initialize the devices state with an empty array if props.location.devices is not an array.
  const [devices, setDevices] = useState<Device[]>(Array.isArray(props.location.devices) ? props.location.devices : []);
  const [batteryState, setBatteryState] = useState<BatteryState | null>(null);

  useEffect(() => {
    setDevices([...devices])
  }, [devices?.length]);

  // for fetch the Fw version result 
  const fetchFWResult = async (endTime: number) => {
    try {
      if (devices.length === 0) return;

      const fwResult = [];

      const onlineUnitsDevices = devices?.filter((d) => getHubStatus(d?.last_seen ?? "") === "online");
      const offlineUnitsDevices = devices?.filter((d) => getHubStatus(d?.last_seen ?? "") === "offline");

      // Process onlineFwVersionResult for online devices
      if (onlineUnitsDevices.length > 0) {
        const onlineFwVersionResult = await prometheus.query(`aerl_srx_firmware_version{serial_number=~"${onlineUnitsDevices.map((d) => d.serial_no).join('|')}"}`, endTime);
        if (onlineFwVersionResult.status && onlineFwVersionResult.status !== "success") {
          setIsLoading((prevState) => ({ ...prevState, fw_versionResult: false }));
          throw new Error("Error in fetch online firmware_version result");
        }
        fwResult.push(...onlineFwVersionResult.data.result);
      }

      // Process offlineFwVersionResult for offline devices
      for (const offlineDevice of offlineUnitsDevices) {
        const time = offlineDevice.last_seen && offlineDevice?.last_seen / 1000;
        const offlineFwVersionResult = await prometheus.query(`aerl_srx_firmware_version{serial_number="${offlineDevice.serial_no}"}&time=${time}`);
        if (offlineFwVersionResult.status && offlineFwVersionResult.status !== "success") {
          setIsLoading((prevState) => ({ ...prevState, fw_versionResult: false }));
          throw new Error("Error in fetch offline firmware_version result");
        }
        fwResult.push(...offlineFwVersionResult.data.result);
      }
      return fwResult;
    } catch (error) {
      console.error(error);
    }
  }

  // for fetch the devices status 
  const fetchDeviceStatusResult = async (startTime: number, endTime: number, step: number) => {
    try {
      if (devices.length != 0) {
        const result = await prometheus.queryRange(
          `sum by (_name_, serial_number) ({__name__=~"aerl_srx_flag_.*", hub="${props.location.hub_id}"})`,
          startTime,
          endTime,
          step
        );

        if (result.status != "success") {
          setIsLoading((prevState) => ({ ...prevState, status: false }));
          throw new Error("Error loading status");
        }

        return result ?? [];
      } else {
        return [];
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {

    var isCancelled = false;

    setIsLoading({ fw_versionResult: true, status: true });

    const loadDeviceStatus = async () => {
      try {

        // Mark devices as ok     
        var deviceStatuses: Device[] = props?.location?.devices?.map((d: Device) => {
          return {
            ...d,
            status: Array<[number, string]>(),
            fw_version: ""
          };
        });

        const start = new Date().getTime() / 1000 - 60 * 60 * 24 * 7;
        const end = new Date().getTime() / 1000;
        const step = Math.max(1, Math.floor((end - start) / 5000));


        if (isCancelled) return;

        //call the  device status
        fetchDeviceStatusResult(start, end, step).then((result: any) => {
          // Set the most recently changed error flag for each device
          // This should hopefully redone.
          for (let i = 0; i < result?.data?.result.length; i++) {
            for (let j = 0; j < deviceStatuses?.length; j++) {
              // Get a metric value
              const r = result?.data?.result[i];
              // Get the last state of that error value
              const latestErrorValue = r.values[r.values.length - 1];

              // If this status corresponds to this device AND the flag is high
              if (
                deviceStatuses[j].serial_no == r.metric.serial_number &&
                latestErrorValue[1] == 1
              ) {
                // Now, we have to see which flag most recently went high - that is the one we must display
                for (var k = 1; k < r.values.length; k++) {
                  if (r.values[r.values.length - k][1] == "0") break;
                }
                deviceStatuses[j].status?.push([
                  k,
                  prettyPrintError(r.metric.__name__) ?? "Unknown Fault",
                ]);
              }
            }
          }

          // Sort the status by the most recent error
          deviceStatuses = deviceStatuses.map((d) => {
            return {
              ...d,
              status: d.status?.sort((a, b) => a[0] - b[0]),
            };
          });
          setDevices(deviceStatuses);
          setIsLoading((prevState) => ({ ...prevState, status: false }));
        }).catch((error: any) => {
          console.log("Error:", error)
          setIsLoading((prevState) => ({ ...prevState, status: false }));
        })

        // call the for fw_version 
        fetchFWResult(end).then((res: any) => {
          res?.map((r: any) => {
            const lastFwValue = r?.value[r?.value?.length - 1];
            // set the version data with matching serial No 
            const deviceToUpdate = deviceStatuses.find((device) => device.serial_no === r?.metric?.serial_number);
            if (deviceToUpdate && lastFwValue) {
              deviceToUpdate.fw_version = prettyPrintFWVersion(parseInt(lastFwValue));
            }
          });
          setDevices(deviceStatuses)
          setIsLoading((prevState) => ({ ...prevState, fw_versionResult: false }));
        }).catch((error: any) => {
          console.log("Error:", error)
          setIsLoading((prevState) => ({ ...prevState, fw_versionResult: false }));
        })

        if (isCancelled) return;

      } catch (error) {
        console.error("Error loading data:", error);
        setIsLoading({ status: false, fw_versionResult: false });
      }
    };

    const loadBatteryStatus = async () => {
      try {
        if (devices.length != 0) {
          const start = new Date().getTime() / 1000 - 60 * 60 * 24 * 7;
          const end = new Date().getTime() / 1000;
          const step = Math.max(1, Math.floor((end - start) / 5000));

          if (isCancelled) return;

          const result = await prometheus.query(
            `{__name__=~"pylontech_battery_lv_soc_soh_soc|pylontech_battery_lv_soc_soh_soh|pylontech_battery_lv_actual_values_voltage|pylontech_battery_lv_error_warnings_.*", hub="${props.location.hub_id}"}`
          );

        if (isCancelled) return;

        // Prometheus failed
        if (result.status != "success") {
          console.error("Error loading status");
          throw new Error("Error loading status");
        }

        const data = result.data.result;
        if (isCancelled) return;

        var state: BatteryState = {
          batteryConnected: true,
          batterySOC: "0",
          batterySOH: "0",
          batteryVoltage: "0",
          batteryFault: false,
        };

        if (data.length == 0) {
          return;
        }

        data.forEach((metric: any) => {
          if (metric.metric.__name__ == "pylontech_battery_lv_soc_soh_soc") {
            state.batterySOC = metric.value[1];
          }
        });

        data.forEach((metric: any) => {
          if (metric.metric.__name__ == "pylontech_battery_lv_soc_soh_soh") {
            state.batterySOH = metric.value[1];
          }
        });

        data.forEach((metric: any) => {
          if (
            metric.metric.__name__ == "pylontech_battery_lv_actual_values_voltage"
          ) {
            state.batteryVoltage = metric.value[1].slice(0, 4);
          }
        });

        data.forEach((metric: any) => {
          if (
            metric.metric.__name__ != "pylontech_battery_lv_soc_soh_soc" &&
            metric.value == 1
          ) {
            state.batteryFault = true;
          }
        });

          setBatteryState(state);
        }
      } catch (error) {
        // Currently we can just ignore the errors.
        console.error(error);
      }
    };

    loadBatteryStatus();
    loadDeviceStatus();

    return () => {
      isCancelled = true;
    };
  }, [props.location]);

  const deviceTableHeader: Array<CommonTableColumnProps> = [
    {
      label: "MODEL",
      value: "model",
      rowStyle: { fontWeight: "600" },
      style: { width: '25%' },
      component(value) {
        return <p>{value}</p>;
      },
    },
    {
      label: "SERIAL #",
      value: "serial_no",
      style: { width: "15%" },
      rowStyle: { color: "#ffffff!important", paddingLeft: 10 },
      component(serial_no) {
        return <CopyButton text={serial_no} icon={false} />;
      },
    },
    {
      label: "FW VERSION",
      value: "fw_version",
      style: { width: "15%" },
      rowStyle: { paddingLeft: 16 },
      component(value) {
        return (
          <p>
            {value ? (
              value
            ) : (
              <>
                {isLoading.fw_versionResult ? (
                  <Spinner color="secondary" size="sm" className="left-5" />
                ) : (
                  <span>-</span>
                )}
              </>
            )}
          </p>
        );
      },
    },
    {
      label: "STATUS",
      value: "status",
      style: { paddingLeft: "0", width: "15%" },
      rowStyle: { paddingLeft: 4 },
      component(status) {
        return (
          <p>
            {isLoading.status ? (
              <Spinner color="secondary" size="sm" className="left-2" />
            ) : status?.at(0)?.at(1) ? (
              status?.at(0)?.at(1)
            ) : (
              "OK"
            )}
          </p>
        );
      },
    },
    {
      style: { width: "16%", paddingLeft: "0", marginRight: 30 },
      rowStyle: {
        paddingLeft: 9,
      },
      label: "CONNECTED",
      value: "last_seen",
      component(last_seen) {
        return (
          <div className="items-center">
            <OnlineBadge timestamp={last_seen ?? null} />
          </div>
        );
      },
    },
  ];

  const batteryTableHeader: Array<CommonTableColumnProps> = [
    {
      label: "MODEL",
      value: "batteryConnected",
      component(online) {
        return <p>Pylontech US Series</p>;
      },
    },
    {
      label: "SOC",
      value: "batterySOC",
      component(value) {
        return <p>{value}%</p>;
      },
    },
    {
      label: "SOH",
      value: "batterySOH",
      component(value) {
        return <p>{value}%</p>;
      },
    },
    {
      label: "STATUS",
      value: "batteryFault",
      component(status) {
        return <p>{status ? "FAULT" : "OK"}</p>;
      },
    },
    {
      label: "CONNECTED",
      value: "batteryConnected",
      component(_) {
        return (
          <div className="items-center">
            <OnlineBadge timestamp={new Date()} />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="items-center flex mb-2.5 ms-4">
        <div>
          <OnlineBadge timestamp={props.location.last_seen} hideText />
        </div>
        <h4 className="text-textColor font-semibold text-xl ms-1.5 tracking-tighter	">
          {props.location.tag}
        </h4>
        <div>
          {props.loading && <Spinner className="text-currentcolor" size="sm" />}
        </div>
      </div>

      <div className={`common-table text-textColor rounded-xl p-3 ${batteryState ? 'bg-backgroundContrast shadow-small' : 'bg-transparent shadow-none'}`}>
        {batteryState && (
          <>
            <h3 className="text-textColor text-lg font-bold px-3 pt-3">Battery</h3>
            <CommonTable
              columns={batteryTableHeader}
              data={[batteryState]}
              pagination={{ perPage: 5 }}
            />
            <Spacer />
            <h3 className="text-textColor text-lg font-bold px-3">Chargers</h3>
          </>
        )}

        <CommonTable
          columns={deviceTableHeader}
          data={devices}
        />
      </div>
    </>
  );
};
