import Layout from "@/components/layouts/main";
import CommonTable, { CommonTableColumnProps } from "@/components/CommonTable";
import { LayoutProps } from "@/components/layouts";
import ConfirmModel from "@/components/modals/confirm_model";
import { InviteUserModal } from "@/components/modals/invite_user";
import { useToast } from "@/hooks/toast";
import useCurrentUser from "@/hooks/useCurrentUser";
import { roles } from "@/util";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Spacer,
} from "@nextui-org/react";
import { useAsyncList } from "@react-stately/data";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { Plus, Trash } from "react-feather";
import { DownArrow } from "../../components/icons";

const membersListCols: Array<CommonTableColumnProps> = [
  {
    label: "NAME",
    value: "name",
    style: { width: '20%' },
    component(value, row) {
      return (
        <h2 className="truncate">
          {value
            ? `${value}${row.email === row.login_user_email ? " (me)" : ""}`
            : "..."}
        </h2>
      );
    },
  },
  {
    label: "EMAIL",
    value: "email",
    style: { width: '25%' },
    rowStyle: { paddingLeft: 10 },
    component(value) {
      return (
        <p>{value}</p>
      )
    }
  },
  {
    label: "ROLE",
    value: "role",
    style: { width: '8%', paddingLeft: '20px' },
    rowStyle: { paddingLeft: '0' },
    component(value, row) {
      const disableKeys =
        row.currentOrgUser?.role === "admin" ? ["owner", "admin"] : [];

      return (
        <Dropdown isDisabled={!row.isAdminOrOwner || row.isOwnRole(value)} className="bg-default border border-border p-2 w-[252px]">
          <DropdownTrigger>
            <Button
              isDisabled={!row.isAdminOrOwner || row.isOwnRole(value)}
              className="md:mt-0 gap-1.5 text-TextColor font-medium px-5 disabled:text-secondaryText opacity-100 capitalize"
            >
              {value}
              <DownArrow />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="update pendingInvitation user role menu"
            selectedKeys={value ? new Set([value]) : undefined}
            selectionMode="single"
            onAction={(role) => {
              if (role === "owner")
                row.onOwnerRoleSwitch(
                  row.id,
                  row.login_user_id,
                  value,
                  row.name
                );
              else row.updateUserRole(row.id, role as string);
            }}
            disabledKeys={disableKeys}
            className="p-0 w-full h-auto rounded-[9px]"
          >
            <DropdownSection title="Change role" className="mb-0 user-dropdown-sec-title">
              {roles.map((r) => (
                <DropdownItem key={r} className="dropdown hover:!bg-backgroundHover focus:!bg-backgroundHover hover:!text-blackHover text-textColor focus:!text-blackHover py-2 px-3 w-full duration-500 edit-dropdown">
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </DropdownItem>
              ))}
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      );
    },
  },
  {
    label: "ACTION",
    style: { width: '8%', textAlign: 'right' },
    component(_, row) {
      return (
        <div className="flex justify-end">
          <Button
            onPress={() => row.removeUser(row.id)}
            disabled={!row.isAdminOrOwner || row.isOwnRole(row.role)}
          >
            <Trash size={20} className="text-textColor" />
          </Button>
        </div>
      );
    },
  },
];

const pendingMembersCols: Array<CommonTableColumnProps> = [
  {
    label: "EMAIL",
    value: "email",
    style: { width: '25%' },
    component(value) {
      return (
        <p className="font-semibold">{value}</p>
      )
    }
  },
  {
    label: "ROLE",
    value: "role",
    style: { width: '15%' },
    component(value) {
      return (
        <p>{value}</p>
      )
    }
  },
  {
    label: "STATUS",
    value: "status",
    style: { width: '8%', paddingLeft: '20px' },
    rowStyle: { paddingLeft: 26 },
    component(value) {
      return (
        <p className={`${value == "declined" ? "text-error" : "text-textColor"}`} > {value.charAt(0).toUpperCase() + value.slice(1)}</p >
      )
    }
  },
  {
    label: "ACTION",
    style: { width: '8%', textAlign: 'right' },
    component(_, row) {
      return (
        <div className="flex justify-end">
          <Button
            onPress={() => row.removeInvite(row.id)}
            disabled={!row.isAdminOrOwner}
          >
            <Trash size={20} className="text-textColor" />
          </Button>
        </div>
      );
    },
  },
];

export default function Organization(props: LayoutProps) {
  const supabase = useSupabaseClient();
  const [modal, setModal] = useState(<></>);
  const { getCurrentOrgUser, user, isAdminOrOwner, isOwnRole, currentOrgUser } = useCurrentUser();
  const [inviteListLoadingValue, setInviteListLoadingValue] = useState<number>(0);
  const [memberListLoadingValue, setMemberListLoadingValue] = useState<number>(0);
  const { add } = useToast();

  // for get the organization member data
  const load = async () => {
    setMemberListLoadingValue(1);
    const { data } = await supabase.rpc("get_org_users");
    await getCurrentOrgUser();
    return {
      items: data ?? [],
    };
  };

  // for get pending Invitation member data
  const inviteload = async () => {
    setInviteListLoadingValue(1);
    const { data, error } = await supabase.from("org_invite").select("*");
    await getCurrentOrgUser();
    if (error) console.error(error);

    return {
      items: data ?? [],
    };
  };

  const list = useAsyncList({ load });
  const Invitelist = useAsyncList({ load: inviteload });

  // subscribe event for org_member
  useEffect(() => {
    const sub = supabase
      .channel("any")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "org_member",
        },
        list.reload,
      )
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [list.reload, supabase]);

  // subscribe event for org_invite
  useEffect(() => {
    const sub = supabase
      .channel("any")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "org_invite",
        },
        Invitelist.reload,
      )
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [Invitelist.reload, supabase]);

  const openInvite = () => {
    const disabledKeys = currentOrgUser?.role === "admin" ? ["admin"] : [];

    setModal(
      <InviteUserModal
        disabledRoles={disabledKeys}
        list={list.items}
        onClose={(isReload) => {
          if (isReload) {
            Invitelist.reload();
            setModal(<></>);
          }
          setModal(<></>)
        }}
      />,
    );
  };

  // for remove organization Member
  const removeUser = async (id: string | null) => {
    setModal(
      <ConfirmModel
        open={true}
        confirmButtonText="Delete"
        onConfirm={async () => {
          const { error } = await supabase
            .from("org_member")
            .delete()
            .eq("user_id", id);

          if (!error) {
            setModal(<></>);
            list.reload();
            add({
              message: "Removed User",
              description: "User removed successfully!",
              severity: "success",
            });
          } else {
            add({
              message: "Removing User Failed",
              description: "User not removed!",
              severity: "error",
            });
          }
          return true;
        }}
        onCancel={() => {
          setModal(<></>);
        }}
      />,
    );
  };

  const onOwnerRoleSwitch = async (
    user_id: string,
    login_user_id: string,
    new_user_old_role: string,
    user_name: string,
  ) => {
    setModal(
      <ConfirmModel
        open={true}
        title="Transfer Ownership"
        description={`Are you sure you want to transfer ownership of ${user?.user_metadata.org.name} to ${user_name}?`}
        confirmButtonText="Transfer"
        onConfirm={async () => {
          try {
            const { error: owner_role_error }: any = await supabase
              .from("org_member")
              .update({ role: "owner" })
              .eq("user_id", user_id);

            if (owner_role_error) throw Error();
            const { error: admin_role_error }: any = await supabase
              .from("org_member")
              .update({ role: "admin" })
              .eq("user_id", login_user_id);
            if (admin_role_error) {
              await supabase
                .from("org_member")
                .update({ role: new_user_old_role || "viewer" })
                .eq("user_id", user_id);
              throw Error();
            }
            add({
              message: "Updated User Role",
              description: "The user's role has been updated successfully.",
              severity: "success",
            });
          } catch (error) {
            add({
              message: "Updated User Role",
              description:
                "Failed to update transfer ownership. Please try again.",
              severity: "error",
            });
          }
          setModal(<></>);
          list.reload();
          return true;
        }}
        onCancel={() => {
          setModal(<></>);
        }}
      />,
    );
  };

  // for remove pending invitation User Member
  const removeInvite = async (id: string | null) => {
    if (!id) {
      console.error("Could not delete invite. No ID provided.");
    }

    setModal(
      <ConfirmModel
        open={true}
        description="Are you sure you want to cancel this invitation? Canceling the invitation will revoke access for the user, and they won't be able to join your organization"
        confirmButtonText="Delete"
        onConfirm={async () => {
          const { error } = await supabase
            .from("org_invite")
            .delete()
            .eq("id", id);
          if (!error) {
            setModal(<></>);
            Invitelist.reload();
            add({
              message: "Cancelled Invitation",
              description: "Invitation canceled successfully!",
              severity: "success",
            });
          } else {
            add({
              message: "Cancelling Invitation Failed",
              description: "Cancelling invitation failed. Please try again!",
              severity: "error",
            });
          }
        }}
        onCancel={() => {
          setModal(<></>);
        }}
      />
    );
  };

  // Update Organization Member Role
  const updateUserRole = async (id: string, role: string) => {
    try {
      const { error, data }: any = await supabase
        .from("org_member")
        .update({ role: role || "viewer" })
        .eq("user_id", id);
      if (!error) {
        add({
          message: "Updated User Role",
          description: "The user's role has been updated successfully.",
          severity: "success",
        });
        list.reload();
      }
    } catch (error) {
      add({
        message: "Updated User Role",
        description: "Failed to update the user's role. Please try again.",
        severity: "error",
      });
    }
  };

  list.items.sort((a: any, b: any) =>
    a.name && b.name ? a.name.localeCompare(b.name) : 0
  );
  return (
    <Layout {...props} titleSuffix="Organization Settings">
      <Spacer y={10} />
      <div className="justify-between flex">
        <div>
          <Button onPress={openInvite} disabled={!isAdminOrOwner} className="px-5 bg-primaryLight hover:bg-primaryLightHover text-primaryLightContrast font-medium disabled:bg-backgroundHover disabled:text-secondaryText">
            <Plus /> Invite Member
          </Button>
        </div>
        <div className="flex justify-end"></div>
      </div>
      <Spacer y={5} />
      <CommonTable
        columns={membersListCols}
        data={list.items.map((item: any) => ({
          currentOrgUser,
          isAdminOrOwner,
          login_user_email: user?.email,
          login_user_id: user?.id,
          isOwnRole,
          removeUser,
          updateUserRole,
          onOwnerRoleSwitch,
          ...item,
        }))}
        isLoading={(memberListLoadingValue === 0 && !list.items.length) || list.isLoading ? true : false}
        pagination={{ perPage: 5 }}
      />
      <Spacer y={5} />
      <h2 className="mb-2.5 text-2xl font-semibold text-textColor">Pending Invitations</h2>
      <CommonTable
        columns={pendingMembersCols}
        data={Invitelist.items.map((item: any) => ({
          isAdminOrOwner,
          currentOrgUser,
          isOwnRole,
          removeInvite,
          ...item,
        }))}
        isLoading={(inviteListLoadingValue === 0 && !Invitelist.items.length) || Invitelist.isLoading ? true : false}
        pagination={{ perPage: 5 }}
      />
      <Spacer y={1} />
      {modal}
    </Layout>
  );
}
