import { redirect } from "next/navigation";

// /admin has no page of its own: send the user to the first section
export default function AdminPage() {
  redirect("/admin/movies");
}
