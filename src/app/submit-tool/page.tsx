import { redirect } from "next/navigation";

export default function SubmitToolPage() {
  redirect("/?submit-tool=open");
}
