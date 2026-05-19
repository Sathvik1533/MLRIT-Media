import { tenant } from "@/config/tenant";
import { QualityTester } from "./QualityTester";

export const metadata = {
  title: `Test Lab — ${tenant.shortName} Performance Observatory`,
};

export default function TestLabPage() {
  return <QualityTester />;
}
