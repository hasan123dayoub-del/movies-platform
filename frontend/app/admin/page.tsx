import { redirect } from "next/navigation";

// /admin opens on the overview
export default function AdminPage() {
  redirect("/admin/stats");
}
