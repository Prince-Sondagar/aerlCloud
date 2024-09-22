import { useRouter } from "next/router";
import { getThemes } from "@/util";
import {
  Spacer,
  Button,
  Card,
  Spinner,
  Table,
  Pagination,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  CardBody,
} from "@nextui-org/react";
import { Database } from "@/supabase/types";
import { ChevronRight, LogOut } from "react-feather";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import React, { useEffect, useState } from "react";
import CardLayout from "@/components/layouts/card";
import { useToast } from "@/hooks/toast";

type Org = Database["public"]["Tables"]["org"]["Row"];
interface Orgs extends Org {
  status?: string;
  inviteId?: string;
}

export default function LoginForm({ orgs, isLoading, }: { orgs: Orgs[]; isLoading: boolean; }) {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [paginatedOrgs, setPaginatedOrgs] = useState<Array<Orgs>>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    perPage: number;
  }>({ page: 1, perPage: 5 });

  useEffect(() => {
    router.prefetch("/");
  }, [router]);

  useEffect(() => {
    const startFrom = (pagination.page - 1) * pagination.perPage;
    const endWith = startFrom + pagination.perPage;
    setPaginatedOrgs(orgs.slice(startFrom, endWith));
  }, [orgs, pagination]);

  useEffect(() => {
    const totalPages = Math.ceil(orgs.length / pagination.perPage);
    if (pagination.page > totalPages) {
      setPagination((prevState) => ({ ...prevState, page: totalPages }));
    }
  }, [orgs.length, pagination.perPage, pagination.page]);

  const onChangePage = (pageNumber: number) => {
    setPagination((prevState) => ({ ...prevState, page: pageNumber }));
  };

  const { themeLabel } = getThemes();

  return (
    <CardLayout titleSuffix="Change Organization" hideNav>
      <div style={{ width: "100%" }} className="switch-table -mt-1.5">
        <Table aria-label="Select Organization Table" className="bg-backgroundContrast p-0">
          <TableHeader>
            <TableColumn className="bg-transparent text-center">
              <p id="modal-title" className="text-textColor text-lg mb-[18px]">
                Select an Organization
              </p>
            </TableColumn>
          </TableHeader>
          <TableBody items={paginatedOrgs}>
            {(org) => (
              <TableRow key={org.id}>
                <TableCell>
                  <OrgButton org={org} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="mt-1 pt-6">
          {isLoading ? (
            <Spinner size="sm" />
          ) : orgs.length && orgs.length > pagination.perPage ? (
            <Pagination
              page={pagination.page}
              total={Math.ceil(orgs.length / pagination.perPage)}
              onChange={onChangePage}
              className={`flex justify-center text-textColor ${themeLabel}-pagination table-pagination`}
              showControls
            />
          ) : !orgs.length ? (
            <p className="text-textColor text-center opacity-25 tracking-tighter">No Organization Found</p>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className="pt-4">
        <Spacer y={2.5} />
        <Button onPress={() => router.push("/organization/create")} className="w-96 mx-auto flex bg-primaryLight hover:bg-primaryLightHover font-medium text-primaryLightContrast w-full">
          Create an Organization
        </Button>
        <Spacer y={2.5} />
        <Button
          onPress={async () => {
            await supabase.auth.signOut();
            return router.push("/login");
          }}
          className="bg-transparent text-textColor w-full"
        >
          <LogOut /> Sign Out
        </Button>
      </div>
    </CardLayout>
  );
}


function OrgButton({ org }: { org: Orgs }) {
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState({ joinOrg: false, declineInvite: false });
  const toast = useToast();
  const router = useRouter();

  const changeOrg = async (org: Orgs) => {
    setLoading((prevState) => ({ ...prevState, joinOrg: true }));

    const { error, data } = await supabase.auth.updateUser({ data: { org: org } });

    if (error) {
      console.error(error);
      setLoading((prevState) => ({ ...prevState, joinOrg: false }));
      return;
    }

    await supabase.auth.refreshSession();
    setTimeout(() => {
      window.location.pathname = "/"; // go home
    });
  };

  const acceptInvitation = async (org: Orgs) => {
    setLoading((prevState) => ({ ...prevState, joinOrg: true }));

    const { data, error } = await supabase.functions.invoke("accept-invite", {
      body: {
        orgInviteId: org.inviteId,
      },
    });
    if (data.success) {
      toast.add({
        message: "Successfully Added",
        description: "You have successfully Join the organization",
        severity: "success",
      });
      changeOrg(org);
    } else {
      console.log(error);
      setLoading((prevState) => ({ ...prevState, joinOrg: false }));
    }
  };

  const declineInvitation = async (org: Orgs) => {
    setLoading((prevState) => ({ ...prevState, declineInvite: true }));

    const { data } = await supabase.functions.invoke("invite/decline", {
      body: {
        inviteId: org.inviteId,
      },
    });
    if (data?.success) {
      setLoading((prevState) => ({ ...prevState, declineInvite: false }));
      router.replace(router.asPath);
    } else {
      setLoading((prevState) => ({ ...prevState, declineInvite: false }));
    }
  };

  return (
    <Card
      isPressable
      onPress={() => changeOrg(org)}
      className="w-full p-2.5 bg-transparent border border-border shadow-none"
    >
      <CardBody className="p-0 w-full">
        <div className="w-full flex justify-between items-center gap-2">
          <b className="px-2.5 text-base text-textColor whitespace-nowrap">{org.name}</b>
          {org.status ? (
            <div className="flex gap-3">
              <Button
                onPress={() => acceptInvitation(org)}
                className="bg-primaryLight text-primaryLightContrast font-medium px-5  hover:bg-primaryLightHove w-[75px]"
              >
                {loading.joinOrg ? <Spinner size="sm" /> : "Join"}
              </Button>
              <Button
                onPress={() => declineInvitation(org)}
                className="text-error border border-error font-medium px-3 w-[75px]"
              >
                {loading.declineInvite ? (
                  <Spinner size="sm" color="danger" />
                ) : (
                  "Decline"
                )}
              </Button>
            </div>
          ) : (
            <Button
              onPress={() => changeOrg(org)}
              className="min-w-unit-0 px-unit-0 min-w-[43px] bg-primaryLight hover:bg-primaryLightHover font-medium"
            >
              {loading.joinOrg ? (
                <Spinner size="sm" />
              ) : (
                <ChevronRight className="text-primary" />
              )}
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createPagesServerClient(ctx);

  let isLoading = true;
  const currentUser = await supabase.auth.getUser();
  const { data }: any = await supabase.from("org").select("*");
  const orgInviteList = await supabase.functions.invoke("invite/get", {
    body: {
      email: currentUser.data.user?.email,
    },
  });

  isLoading = false;
  const orgList = [...data, ...orgInviteList.data?.data];
  const sortedOrgs = orgList
    ? [...orgList].sort((a, b) => (a?.name ?? "").localeCompare(b?.name ?? ""))
    : [];

  return {
    props: {
      orgs: sortedOrgs,
      isLoading,
    },
  };
};
