import { Database } from "@/supabase/types";
const themes = require("../components/themes/index");

export type userRoles = Database["public"]["Enums"]["user_role"];

// for storing data into localStorage
export const setLocalStorageData = (localStorageKey: string, data: any) => {
  return localStorage.setItem(localStorageKey, data);
};

// for getting  data from the localStorage
export const getLocalStorageData = (localStorageKey: string) => {
  return localStorage.getItem(localStorageKey);
};

// check role of user is admin or Owner
export const checkIsAdminOrOwner = (role: string) => {
  return role === "admin" || role === "owner";
};

// User roles
export const roles: userRoles[] = ["owner", "admin", "technician", "viewer"];
export const invitationRoles: userRoles[] = ["admin", "technician", "viewer"];

export function getThemes() {
  return {
    theme: themes.InstanceContext._currentValue.theme?.light,
    themeLabel: themes.InstanceContext._currentValue.themeLabel,
  };
}


export const getHubStatus = (last_seen: Date | string | number): "online" | "offline" => {
  const date = new Date(last_seen);
  const now = new Date();

  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff <= 60 * 5) {
    return "online"
  }
  return "offline"
}
