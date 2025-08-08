import { AdminAttributesPageClient } from "./components/AdminAttributesPageClient";
import { getAttributes } from "./getAttributes";

export default async function AdminAttributesPage() {
  const attributes = await getAttributes();

  return <AdminAttributesPageClient attributes={attributes} />;
}
