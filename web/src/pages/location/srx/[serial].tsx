import { createContext, useEffect, useState } from "react";
import getTimeOptions, { timeOptions } from "@/util/time_options";
import { useRouter } from "next/router";
import Chart from "@/components/vis/chart";
import Layout, { LayoutProps } from "@/components/layouts/main";
import {
  Spacer,
  Link,
  Dropdown,
  Button,
  DropdownMenu,
  DropdownItem,
  DropdownTrigger,
} from "@nextui-org/react";
import { ArrowLeft, Clock } from "react-feather";
import TimeContextProvider from "@/components/vis/time_context";
import { prometheus } from "@/api/prometheus";
import { Circle, DownArrow } from "@/components/icons";

export const TimeContext = createContext({
  start: getTimeOptions("today").start,
  end: getTimeOptions("today").end,
});

export default function Home(props: LayoutProps) {
  const [time, setTime] = useState(getTimeOptions("today"));
  const router = useRouter();
  const serial = router.query.serial;
  const labelQuery = `serial_number="${serial}"`;
  const [online, setOnline] = useState(false);

  const properties = [{ name: "Model", value: "CoolMax SRX 600/55-48" }];

  useEffect(() => {
    const update = () => {
      try {
        const uid = localStorage?.getItem("dashboard-time");

        if (uid) {
          const newTime = getTimeOptions(uid);
          if (!newTime) return;

          if (time.end != newTime.end || time.start != newTime.start) {
            setTime(newTime);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    const interval = setInterval(update, 30_000);

    update();

    return () => clearInterval(interval);
  }, []);

  // Online status
  useEffect(() => {
    var isCancelled = false;
    const checkOnlineStatus = async () => {
      let result = await prometheus.query(
        `aerl_srx_information_serial_number{serial_number="${serial}"}`,
      );

      if (isCancelled || result.status != "success") return;
      console.log(result.data.result.length);
      if (result.data.result.length > 0) {
        setOnline(true);
      } else {
        setOnline(false);
      }
    };

    checkOnlineStatus();

    return () => {
      isCancelled = true;
    };
  }, [time, serial]);

  return (
    <Layout {...props}>
      <div className="mx-1">
        <Spacer y={8} />
        <div>
          <div>
            <Link href="/locations">
              <Button
                className="bg-primaryLight text-primaryLightContrast font-medium px-5"
              >
                <ArrowLeft className="stroke-primaryLightContrast" /> Return to Locations
              </Button>
            </Link>
          </div>
        </div>
        <Spacer y={8} />
        <div className="ml-1">
          <div>
            <div>
              <div className="flex items-center">
                <div className="text-textColor text-[32px] font-semibold">
                  CoolMax SRX - {serial}
                </div>
                <Spacer x={2} />
                <div className="bg-successLightContrast">
                  <Circle
                    size={16}
                    color={
                      online
                        ? "#13A452"
                        : "#687076"
                    }
                  />
                </div>
              </div>
              <div>
                <div>
                  <div className="text-textColor font-semibold text-lg leading-[21px] mt-0.5">
                    Specifications
                  </div>
                  <div className="mx-4 mt-1.5">
                    {properties.map((property) => (
                      <div key={property.name} className="flex">
                        <p className="text-textColor leading-7 pr-3 font-semibold">
                          {property.name}
                        </p>
                        <p className="text-textColor leading-7 tracking-tighter">{property.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Spacer y={5} />
        <div>
          <Dropdown className="bg-backgroundContrast border-border border note-icon">
            <DropdownTrigger>
              <Button className="gap-1.5 bg-primaryLight hover:bg-primaryLightHover text-primaryLightContrast font-medium px-5 disabled:bg-backgroundHover disabled:text-secondaryText opacity-100 ms-1.5">
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
                const newTime = getTimeOptions(key as string);

                if (newTime) {
                  setTime(newTime);
                  if (window) localStorage.setItem("dashboard-time", newTime.uid);
                }
              }}
            >
              {timeOptions.map(({ uid, name }) => {
                return <DropdownItem key={uid} className="dropdown hover:!bg-backgroundHover focus:!bg-backgroundHover hover:!text-blackHover text-textColor focus:!text-blackHover py-2 px-3 duration-500"><span className="text-base">{name}</span></DropdownItem>;
              })}
            </DropdownMenu>
          </Dropdown>
        </div>
        <Spacer y={1} />
        <TimeContextProvider
          value={{ start: time.start / 1000, end: time.end / 1000 }}
        >
          <div className="mt-5 mb-5">
            <Chart
              aspect={8 / 1}
              title="PV Power"
              unit="W"
              extents={["peak", "avg"]}
              metric={`sum(aerl_srx_pv_voltage{${labelQuery}} * aerl_srx_pv_current) < 100000`}
            />
            <div className="grid md:grid-cols-2 grid-cols-1">
              <Chart
                aspect={8 / 1}
                title="PV Voltage"
                unit="V"
                extents={["max", "avg"]}
                metric={`avg(aerl_srx_pv_voltage{${labelQuery}}) < 100000`}
              />
              <Chart
                aspect={8 / 1}
                title="Battery Voltage"
                unit="V"
                extents={["max", "min"]}
                metric={`avg(aerl_srx_output_voltage{${labelQuery}}) < 100000`}
              />
            </div>
            <div className="grid md:grid-cols-2 grid-cols-1">
              <Chart
                title="PV Current"
                unit="A"
                extents={["max", "avg"]}
                metric={`sum(aerl_srx_pv_current{${labelQuery}}) < 100000`}
              />
              <Chart
                title="Battery Current"
                unit="A"
                extents={["max", "avg"]}
                metric={`sum(aerl_srx_output_current{${labelQuery}}) < 100000`}
              />
            </div>
            <Chart
              aspect={16 / 1}
              title="Heatsink Temperature"
              unit="°C"
              extents={["max", "min"]}
              metric={`avg(aerl_srx_temperature_heatsink{${labelQuery}}) < 1000`}
            />
          </div>
        </TimeContextProvider>
      </div>
    </Layout>
  );
}
