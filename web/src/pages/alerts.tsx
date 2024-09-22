import Layout, { LayoutProps } from "@/components/layouts/main";
import {
  Button,
  Spacer,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { Enums } from "@/supabase/types";
import { AlertCircle, Info, Plus } from "react-feather";
import { Key, useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useAsyncList } from "@react-stately/data";
import CommonTable, { CommonTableColumnProps } from "../components/CommonTable";
import { DownArrow } from "@/components/icons";

export type Severity = Enums<"severity">;

export const severityIcon = (severity: Severity) => {
  switch (severity) {
    case "information":
      return <Info className="stroke-textColor" />;
    case "warning":
      return <AlertCircle className="stroke-[#F5A524]" />;
    case "error":
      return <AlertCircle className="stroke-error" />;
  }
};

export default function Alerts(props: LayoutProps) {

  const alertsHeader: Array<CommonTableColumnProps> = [
    {
      label: "NAME",
      value: "name",
      style: { width: '20%' },
      rowStyle: { paddingLeft: 2 }
    },
    {
      label: "TYPE",
      value: "type",
      style: { width: '20%' },
      rowStyle: { paddingLeft: 8 }
    },
    {
      label: "SEVERITY FILTER",
      value: "severityFilter",
      style: { width: '30%' },
      rowStyle: {paddingLeft: 14}
    },
    {
      label: "LABEL FILTER",
      value: "labelFilter",
      style: { width: '30%' },
      rowStyle: {paddingLeft: 22}
    },
  ];

  return (
    <Layout {...props} titleSuffix="Alerts">
      <Spacer y={10} />
      <h1 className="text-textColor text-5xl font-bold tracking-tighter pb-2.5">Alerts</h1>
      <Spacer y={5} />
      <AlertsTable />
      <Spacer y={5} />
      <AlertRulesTable />
      <Spacer y={5} />
      <h2 className="text-textColor text-4xl font-semibold tracking-tighter pb-2.5">Receivers</h2>
      <Spacer y={5} />
      <div>
        <Button className="bg-primaryLight text-primaryLightContrast font-medium px-5 hover:bg-primaryLightHover" endContent={<Plus />}>
          Add a New Receiver
        </Button>
      </div>
      <Spacer y={5} />
      <CommonTable
        columns={alertsHeader}
        data={[]}
        border={false}
      />
      <Spacer y={5} />
    </Layout>
  );
}

function AlertsTable() {
  const supabase = useSupabaseClient();
  const [severityFilter, setSeverityFilter] = useState<Set<Key>>(new Set([]));
  const [AlertListLoadingValue, setAlertListLoadingValue] = useState<number>(0);


  const load = async () => {
    setAlertListLoadingValue(1)
    let query = supabase.from("alert").select("*");

    if (severityFilter.size > 0) {
      query.in("metadata->labels->>severity", Array.from(severityFilter));
    }

    query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error(error);
      return {
        items: [],
      };
    }

    return {
      items: data,
    };
  };

  const dateFormatter = Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  const alerts = useAsyncList({ load });

  useEffect(() => {
    const subscription = supabase
      .channel("any")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alert" },
        alerts.reload
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, alerts.reload]);


  const alertsTableCols: Array<CommonTableColumnProps> = [
    {
      label: "TIME",
      value: "time",
      rowStyle: { paddingLeft: 0 },
      component(_, row) {
        return (
          <p className="truncate" >
            {dateFormatter.format(new Date(row?.created_at))}
          </p >
        );
      },
    },
    {
      label: "SEVERITY",
      value: "severity",
      rowStyle: { paddingLeft: 12 },
      component(_, row) {
        return (
          <div className="flex gap-2.5 items-center py-2.5">
            {severityIcon((row.metadata as any).labels.severity)}
            <p className="capitalize">{(row.metadata as any).labels.severity}</p>
          </div>
        )
      },
    },
    {
      label: "DETAILS",
      value: "details",
      rowStyle: { paddingLeft: 21 },
      component(value, row) {
        return (<p>{(row.metadata as any).annotations.summary}</p>)
      },
    },
  ];

  return (
    <>
      <div>
        <Dropdown className="bg-default border border-border p-2 w-[252px]">
          <DropdownTrigger>
            <Button className="bg-primaryLight text-primaryLightContrast font-medium px-5 hover:bg-primaryLightHover">
              Severity: {severityFilter.size == 0 ? "All" : severityFilter}
              <DownArrow />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            selectionMode="single"
            selectedKeys={severityFilter}
            onSelectionChange={(selection) => {
              if (selection != "all") setSeverityFilter(selection);
            }}
            className="p-0 w-full h-auto rounded-[9px]"
          >
            <DropdownItem key="information" startContent={severityIcon("information")} className="dropdown hover:!bg-backgroundHover focus:!bg-backgroundHover hover:!text-blackHover text-textColor focus:!text-blackHover py-1.5 px-3 w-full duration-500 edit-dropdown">
              Information
            </DropdownItem>
            <DropdownItem key="warning" startContent={severityIcon("warning")} className="dropdown hover:!bg-backgroundHover focus:!bg-backgroundHover hover:!text-blackHover text-textColor focus:!text-blackHover py-1.5 px-3 w-full duration-500 edit-dropdown">
              Warning
            </DropdownItem>
            <DropdownItem key="error" startContent={severityIcon("error")} className="dropdown hover:!bg-backgroundHover focus:!bg-backgroundHover hover:!text-blackHover text-textColor focus:!text-blackHover py-1.5 px-3 w-full duration-500 edit-dropdown">
              Error
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <Spacer y={5} />

      <CommonTable
        columns={alertsTableCols}
        data={alerts?.items.map((alert) => ({
          ...alert
        }))}
        pagination={{ perPage: 10 }}
        isLoading={(AlertListLoadingValue === 0 && !alerts.items.length) || alerts.isLoading ? true : false}
        border={false}
      />
    </>
  );
}

function AlertRulesTable() {

  const [AlertRulesListLoadingVal, setAlertListLoadingVal] = useState<number>(0);
  const supabase = useSupabaseClient();

  const load = async () => {
    setAlertListLoadingVal(1);
    const { data, error } = await supabase
      .from("alert_rule")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return {
        items: [],
      };
    }

    return {
      items: data,
    };
  };

  const list = useAsyncList({ load });


  const alertRulesTableCols: Array<CommonTableColumnProps> = [
    {
      label: "NAME",
      value: "name",
      style: { width: '20%' },
      rowStyle: { paddingLeft: 0 },
      component(_, row) {
        return (
          <p className="truncate py-1.5" >
            {(row?.rule as any)?.alert}
          </p >
        );
      },
    },
    {
      label: "SEVERITY",
      value: "severity",
      style: { width: '20%' },
      rowStyle: { paddingLeft: 10 },
      component(_, row) {
        return (
          <div>
            <p>{(row?.rule as any)?.labels?.severity}</p>
          </div>
        )
      },
    },
    {
      label: "RULE",
      value: "rule",
      style: { width: '20%' },
      rowStyle: { paddingLeft: 15 },
      component(_, row) {
        return (<p>{(row?.rule as any)?.expr}</p>)
      },
    },
    {
      label: "FOR",
      value: "for",
      style: { width: '20%' },
      rowStyle: { paddingLeft: 18 },
      component(_, row) {
        return (<p>{(row?.rule as any)?.for}</p>)
      },
    },
    {
      label: "LABELS",
      value: "labels",
      style: { width: '20%' },
      rowStyle: { paddingLeft: 24 },
      component(value) {
        return (<p>{value}</p>)
      },
    },
  ];


  return (
    <>
      <h2 className="text-textColor text-4xl font-semibold tracking-tighter pb-2.5">Rules</h2>
      <Spacer y={5} />
      <div>
        <Button className="bg-primaryLight text-primaryLightContrast font-medium px-5 hover:bg-primaryLightHover" endContent={<Plus />}>
          Add a New Rule
        </Button>
      </div>
      <Spacer y={5} />
      <CommonTable
        columns={alertRulesTableCols}
        data={list?.items?.map((item) => ({
          ...item,
          labels: "test"
        }))}
        pagination={{ perPage: 10 }}
        isLoading={(AlertRulesListLoadingVal === 0 && !list.items.length) || list.isLoading ? true : false}
        border={false}
      />
    </>
  );
}
