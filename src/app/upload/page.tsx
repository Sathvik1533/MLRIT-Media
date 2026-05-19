import { tenant } from "@/config/tenant";
import { UploadClient } from "./UploadClient";

export const metadata = {
  title: `Upload — ${tenant.shortName} Performance Observatory`,
};

export default function UploadPage() {
  return <UploadClient />;
}
