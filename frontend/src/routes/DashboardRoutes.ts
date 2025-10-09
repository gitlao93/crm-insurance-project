import { v4 as uuid } from "uuid";
import type { DashboardMenuProps } from "../types";

/**
 * All Dashboard Routes
 *
 * Understanding name/value pairs for Dashboard routes
 *
 * Applicable for main/root/level 1 routes
 * icon        : string - It's only for main menu or you can consider 1st level menu item to specify icon name.
 *
 * Applicable for main/root/level 1 and subitems routes
 * id          : string - You can use uuid() as value to generate unique ID using uuid library, you can also assign constant unique ID for react dynamic objects.
 * title       : string - If menu contains children use title to provide main menu name.
 * badge       : string - (Optional - Default - '') If you specify badge value it will be displayed beside the menu title or menu item.
 * badgecolor  : string - (Optional - Default - 'primary') - Used to specify badge background color.
 *
 * Applicable for subitems / children items routes
 * name        : string - If it's a menu item in which you are specifying a link, use name (don't use title for that).
 * children     : Array - Use to specify submenu items.
 *
 * Used to segregate menu groups
 * grouptitle  : boolean - (Optional - Default - false) If you want to group menu items you can use grouptitle = true,
 * (Use title: value to specify group title e.g. COMPONENTS, DOCUMENTATION that we did here.)
 */

export const DashboardMenu: DashboardMenuProps[] = [
  {
    id: uuid(),
    title: "Dashboard",
    icon: "home",
    link: "/dashboard",
    roles: ["admin", "collection_supervisor", "agent"], // 👈 new
  },
  {
    id: uuid(),
    title: "User",
    icon: "user",
    link: "/user",
    roles: ["admin"], // 👈 only admin can see
  },
  {
    id: uuid(),
    title: "Policy Category",
    icon: "file-text",
    link: "/policy-category",
    roles: ["admin"],
  },
  {
    id: uuid(),
    title: "Policy Catalog",
    icon: "list",
    link: "/policy-catalog",
    roles: ["admin"],
  },
  {
    id: uuid(),
    title: "Policy Holder",
    icon: "users",
    link: "/policy-holder",
    roles: ["admin", "collection_supervisor", "agent"],
  },
  {
    id: uuid(),
    title: "Commission",
    icon: "credit-card",
    link: "/commission",
    roles: ["agent"],
  },
  {
    id: uuid(),
    title: "Lead",
    icon: "book",
    link: "/lead",
    roles: ["admin", "agent"], // 👈 admin & agent
  },
  {
    id: uuid(),
    title: "Message",
    icon: "slack",
    link: "/message",
    roles: ["admin", "collection_supervisor", "agent"], // 👈 all roles
  },
  {
    id: uuid(),
    title: "Setting",
    icon: "settings",
    link: "/setting",
    roles: ["admin"],
  },
];
