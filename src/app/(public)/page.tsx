import { HomepageContent } from "./components/HomepageContent";
import { getHomepageData } from "./getHomepageData";

export default async function HomePage() {
  await getHomepageData(); // This will redirect authenticated users

  return <HomepageContent />;
}
