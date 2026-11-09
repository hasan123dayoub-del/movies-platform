import type { AdminStats } from "../types";
import { getJsonWithAuthOrNull } from "./client";

// The dashboard numbers. Sent with the admin's token and never cached:
// they change with every review and are for admins only.
export function getAdminStats() {
  return getJsonWithAuthOrNull<AdminStats>("/admin/stats", "Failed to load the stats");
}
