import { Badge, Button } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Trash, Edit, Plus } from "react-feather";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useAsyncList } from "@react-stately/data";

import Layout from "@/components/layouts/main";
import { Tables } from "@/supabase/types";
import ConfirmDelete from "@/components/modals/confirm_model";
import OnlineBadge from "@/components/online_badge";
import CommonTable, { CommonTableColumnProps } from "@/components/CommonTable";
import EditDeviceModal from "../components/modals/edit_device";
import useCurrentUser from "../hooks/useCurrentUser";

type GateWay = Tables<"gateways">;

export default function Gateways() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [modal, setModal] = useState(<></>);
  const [gateWaysListLoadingValue, setGateWaysListLoadingValue] = useState(0);
  const { currentOrgUser, getCurrentOrgUser } = useCurrentUser();

  // fetch the current org details
  useEffect(() => {
    getCurrentOrgUser();
  }, [])

  // for get the gateWays data
  const load = async () => {
    setGateWaysListLoadingValue(1);
    const { data } = await supabase
      .from("gateways")
      .select(`*,location(name,id)`)
      .order("hub_id");
    return {
      items: data ?? [],
    };
  };

  const gateWaysList = useAsyncList({ load });

  function editGateWay(gateways: GateWay) {
    setModal(
      <EditDeviceModal
        gateways={gateways}
        onCancel={() => setModal(<></>)}
        onSave={() => {
          gateWaysList.reload();
          setModal(<></>);
        }}
        confirmButtonText="Save"
      />
    );
  }

  function deleteGateWay(gateways: GateWay) {
    setModal(
      <ConfirmDelete
        confirmButtonText="Delete"
        open={true}
        onConfirm={async () => {
          const { error } = await supabase
            .from("gateways")
            .delete()
            .eq("id", gateways.id);

          if (!error) {
            setModal(<></>);
          } else {
            console.error(error);
          }
        }}
        onCancel={() => setModal(<></>)}
        title="This action cannot be reversed without performing the device registration process again."
      />
    );
  }

  function gateWayIsNew(created_at: string) {
    let now = new Date();
    let created = new Date(created_at);

    let minutes = (now.getTime() - created.getTime()) / 60_000;

    return minutes <= 30;
  }

  const TableHeader: Array<CommonTableColumnProps> = [
    {
      label: "SERIAL NO",
      component(_, row) {
        return (
          <div>
            <h2 className="truncate inline">
              {/* css={{ fontFamily: "$mono" }} */}
              {row.hub_id}
            </h2>
            {gateWayIsNew(row.created_at) && (
              <Badge color="primary" variant="flat">
                new
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      label: "LOCATION",
      value: "name",
      style: { paddingLeft: 24 },
      rowStyle: { ps: 5 },
      component(_, row) {
        return <h3 className="truncate">{row?.location?.name ?? "..."}</h3>;
      },
    },
    {
      label: "TAG",
      style: { paddingLeft: 18 },
      component(_, row) {
        return <h3 className="truncate">{row.tag ?? "..."}</h3>;
      },
    },
    {
      label: "STATUS",
      value: "last_seen",
      style: { paddingLeft: 8 },
      rowStyle: { paddingLeft: 14 },
      component(last_seen) {
        return (
          <h3>
            <OnlineBadge timestamp={last_seen} />
          </h3>
        );
      },
    },
    {
      style: {
        textAlign: "right",
      },
      label: "ACTIONS",
      component(_, row) {
        return (
          <div className="flex justify-end">
            <Button
              className="bg-inherit text-textColor"
              onPress={() => row.editGateWay(row)}
              isDisabled={currentOrgUser?.role === "viewer"}
            >
              <Edit size={20} />
            </Button>
            <Button
              className="bg-inherit text-textColor"
              onPress={() => row.deleteGateWay(row)}
              isDisabled={currentOrgUser?.role === "viewer"}
            >
              <Trash size={20} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <Layout titleSuffix="Locations">
      <div className="mx-1">
        <Button
          className="mt-8 bg-primaryLight text-primaryLightContrast font-medium px-5 gap-0 hover:bg-primaryLightHover mb-5"
          onPress={() => router.push("/setup")}
        >
          <Plus className="me-1.5" /> Add Gateway
        </Button>
        <CommonTable
          columns={TableHeader}
          data={gateWaysList.items.map((item: any) => ({
            ...item,
            editGateWay,
            deleteGateWay,
          }))}
          pagination={{ perPage: 10 }}
          isLoading={
            (gateWaysListLoadingValue === 0 && !gateWaysList.items.length) ||
              gateWaysList.isLoading
              ? true
              : false
          }
        />
        {modal}
      </div>
    </Layout>
  );
}
