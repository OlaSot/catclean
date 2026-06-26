import { redirect } from "next/navigation";

export default function UpholsteryBookingRedirectPage() {
  redirect("/booking?service=upholstery");
}
