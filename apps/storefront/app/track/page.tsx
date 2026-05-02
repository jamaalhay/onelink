import { redirect } from "next/navigation";
import { sampleOrder } from "@/lib/mock/orders";

export default function TrackIndex() {
  // Demo: header "Track Order" link drops the user on the sample order's tracking page.
  // In production, this should be a tracking lookup form (order # + phone).
  redirect(`/track/${sampleOrder.id}`);
}
