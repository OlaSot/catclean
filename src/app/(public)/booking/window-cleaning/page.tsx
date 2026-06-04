import { redirect } from "next/navigation";

export default function WindowCleaningBookingRedirectPage() {
  redirect("/booking?service=window_cleaning");
}
