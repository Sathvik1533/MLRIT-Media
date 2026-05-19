import { tenant } from "@/config/tenant";
import { HomepageClient } from "./HomepageClient";

export const metadata = {
  title: `${tenant.shortName} Media Platform — Upload · Optimize · Deliver`,
  description: `Internal media asset performance pipeline for ${tenant.shortName}. Upload assets, benchmark CDN delivery, and certify zero-lag performance before production.`,
};

export default function HomePage() {
  return <HomepageClient />;
}
