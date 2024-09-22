import { Database } from "@/supabase/types";
import {
  Dropdown,
  Image,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Badge,
} from "@nextui-org/react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, {
  useCallback,
  useEffect,
  useState,
  Key,
  useContext,
} from "react";
import {
  EyeOff,
  LogOut,
  Bell,
  Settings,
  User,
  Users,
} from "react-feather";
import { InstanceContext } from "../themes";
import { DownArrow } from "../icons";
import { getThemes } from "../../util";
import { FullScreenContext } from "../vis/fullscreen";

const menuItems = [
  { name: "Dashboard", href: "/" },
  { name: "Locations", href: "/locations" },
  { name: "Gateways", href: "/gateways" },
  { name: "Notifications", href: "/alerts" },
  { name: "Account Settings", href: "/account" },
  { name: "Change Organization", href: "/organization/switch" },
];

export interface OrgMember {
  id: number;
  created_at: string;
  org_id: number;
  user_id: string;
  role: string;
}

export default function Nav() {
  const supabase = useSupabaseClient();
  const instance = useContext(InstanceContext);
  const isFullscreen = useContext(FullScreenContext);
  const router = useRouter();
  const route = router.route.slice(1);
  const [orgMember, setOrgMember] = useState<OrgMember | {}>({});

  async function signOut() {
    await supabase.auth.signOut();
  }

  const items = [
    { name: "Dashboard", href: "/" },
    { name: "Locations", href: "/locations" },
    { name: "Gateways", href: "/gateways" },
  ];

  const onDropdownAction = async (key: Key) => {
    switch (key) {
      case "org-settings":
        router.push("/organization");
        break;
      case "account-settings":
        router.push("/account");
        break;
      case "org-switch":
        router.push("/organization/switch");
        break;
      case "sign-out":
        signOut();
        break;
    }
  };

  // For getting current LoggedIn Organization member Details
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.auth.getUser();
      const user_id = data.user?.id;
      const user_org_id = data.user?.user_metadata.org.id;
      if (user_id && user_org_id) {
        const org_Details = await supabase
          .from("org_member")
          .select("*")
          .eq("user_id", user_id)
          .eq("org_id", user_org_id);
        setOrgMember(org_Details.data?.[0]);
      }
    };
    load();
  }, [supabase]);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);


  return (
    <div className={isFullscreen ? 'mx-3' : 'container mx-auto px-3'}>
      <Navbar
        onMenuOpenChange={setIsMenuOpen}
        className="bg-backgroundContrast justify-between sm:px-6 px-3 mt-1.5 sm:mt-3 rounded-[14px] h-[76px] border border-border  data-[menu-open=true]:!border-solid"
      >
        <NavbarBrand>
          <div className="flex justify-center h-[2.5em] w-auto nav-logo">
            <Image
              alt="Company logo"
              src={instance.logo}
              className="h-full rounded-none mx-auto"
              disableSkeleton={true}
            />
          </div>
        </NavbarBrand>
        <NavbarContent className="nav-menu hidden sm:flex lg:me-16 me-0">
          {items.map((item) => (
            <Link href={item.href} key={item.href}>
              <NavbarItem
                className={`tracking-tighter ${item.href === `/${route}`
                  ? "py-2 px-3 text-primaryLightContrast bg-primaryLight rounded-lg"
                  : "text-textColor bg-transparent px-0.5"
                  }`}
                isActive={
                  item.href === "/" + route || (route === "" && item.href === route)
                }
              >
                {item.name}
              </NavbarItem>
            </Link>
          ))}
        </NavbarContent>
        <NavbarContent className="account-btn hidden sm:flex gap-0">
          <NotificationDropdown />
          <Dropdown className="p-0" placement="bottom-end" offset={6}>
            <DropdownTrigger>
              <Button
                className="bg-transparent text-textColor px-3 gap-0 items-center"
                size="lg"
              >
                Account
                <User className="ms-2" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              className="bg-backgroundContrast border border-border rounded-xl p-2"
              onAction={onDropdownAction}
            >
              <DropdownSection className="border-b border-border pb-1 mb-0">
                <DropdownItem
                  className="group px-3 pb-2 hover:!bg-backgroundHover"
                  key="account-settings"
                >
                  <span className="text-base text-textColor hover:!text-blackHover">
                    Account Settings
                  </span>
                </DropdownItem>
                {['admin', 'owner'].includes((orgMember as OrgMember)?.role as string) ? (
                  <DropdownItem
                    className="group px-3 pb-2 hover:!bg-backgroundHover"
                    key="org-settings"
                  >
                    <span className="text-base text-textColor hover:!text-blackHover">
                      Organization Settings
                    </span>
                  </DropdownItem>
                ) : null as any}
              </DropdownSection>
              <DropdownSection className="mb-0">
                <DropdownItem
                  className="dropdown-menu px-3 mt-0.5 hover:!bg-backgroundHover hover:!text-blackHover"
                  key="org-switch"
                >
                  <Users className="text-textColor " />
                  <span className="text-base ps-2 pe-5 text-textColor">
                    Change Organization
                  </span>
                </DropdownItem>
                <DropdownItem
                  className="dropdown-menu px-3 hover:!bg-backgroundHover  hover:!text-blackHover"
                  key="sign-out"
                >
                  <LogOut className="text-textColor " />
                  <span className="text-base ps-2 pe-5 text-textColor">
                    Sign Out
                  </span>
                </DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden text-textColor me-4"
        />
        <NavbarMenu className="navbar-menu max-w-[94%] pt-7 bg-backgroundLight mx-auto p-0">
          <div className="bg-backgroundMenu p-8">
            {menuItems.map((item) => (
              <NavbarMenuItem key={item.href}>
                <Link href={item.href}>
                  <h2 className="text-textColor text-xl tracking-tighter pb-4">
                    {item.name}
                  </h2>
                </Link>
              </NavbarMenuItem>
            ))}
            {['admin', 'owner'].includes((orgMember as OrgMember)?.role as string) ? (
              <NavbarMenuItem>
                <Link href='/organization'>
                  <h2 className="text-textColor text-xl tracking-tighter pb-4">
                    Organization Settings
                  </h2>
                </Link>
              </NavbarMenuItem>
            ) : null as any}
            <NavbarMenuItem>
                <h2
                  onClick={() => signOut()}
                  role="button"
                  className="w-full text-xl text-textColor tracking-tighter"
                >
                  {" "}
                  Sign Out
                </h2>
            </NavbarMenuItem>
          </div>
        </NavbarMenu>
      </Navbar>
    </div>
  );
}

function NotificationDropdown() {
  type Notification = Database["public"]["Tables"]["notification"]["Row"];

  const router = useRouter();
  const supabase = useSupabaseClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { themeLabel } = getThemes();

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from("notification")
      .select("*")
      .is("read_at", null);

    if (error) {
      console.error(error);
      return;
    }

    setNotifications(data as Notification[]);
  }, [supabase]);

  const clear = async () => {
    const { error } = await supabase
      .from("notification")
      .update({ read_at: new Date().toISOString() })
      .in(
        "id",
        notifications.map((n) => n.id)
      );

    if (error) {
      console.error(error);
    } else {
      fetch();
    }
  };

  const handleSelection = async (keys: Key) => {
    if (keys != "all") {
      switch (keys) {
        case "settings":
          router.push("/alerts");
          break;
        case "clear":
          clear();
          break;
        default: {
          let link = notifications.find((n) => n.id == keys)?.link;
          link && router.push(link);
        }
      }
    }
  };
  useEffect(() => {
    fetch();

    const channel = supabase
      .channel("any")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notification",
          filter: "read_at=is.null",
        },
        () => fetch()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [fetch, supabase]);

  const count = notifications ? notifications.length : 0;

  return (
    <Dropdown className="p-0" placement="bottom-end" offset={6}>
      <DropdownTrigger>
        <Button
          className="bg-transparent text-textColor px-0 items-center gap-2.5 -me-3"
          size="lg"
        >
          <Badge
            color="danger"
            content={count}
            isInvisible={count == 0}
            disableAnimation
          >
            <Bell />
          </Badge>
          <DownArrow />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        className={`${themeLabel}-shadow bg-backgroundContrast border border-border rounded-xl p-2 absolute w-25 top-0 left-6`}
        onAction={handleSelection}
      >
        {count == 0 && (
          <DropdownItem
            className="group px-3 pb-2 hover:bg-[transparent!important] cursor-default duration-500"
            key="none"
          >
            <span className="text-base text-textColor/30">
              No unread notifications.
            </span>
          </DropdownItem>
        )}
        {
          notifications?.slice(0, 5).map((item) => (
            <DropdownItem
              className="text-textColor px-3 hover:!bg-backgroundHover hover:!text-blackHover"
              key={item.id}
              description={item.details ?? ""}
            >
              <span className="text-base text-textColor"> {item.title}</span>
            </DropdownItem>
          )) as any
        }
        {notifications.length > 5 && (
          <DropdownItem key="overflow" variant="light">
            + {notifications.length - 5} more
          </DropdownItem>
        )}
        <DropdownSection className="mb-0 border-t border-border pt-1">
          <DropdownItem
            key="clear"
            className={count == 0 ? "hidden" : "flex hover:!bg-backgroundHover"}
          >
            <div className="flex items-center text-textColor text-base px-1 hover:!text-blackHover">
              <EyeOff className="me-2" />
              Clear
            </div>
          </DropdownItem>
          <DropdownItem
            className="dropdown-menu px-3 hover:!bg-backgroundHover hover:!text-blackHover text-textColor"
            key="settings"
          >
            <Settings />
            <span className="text-base ps-2 pe-5">Notification Settings</span>
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown >
  );
}
