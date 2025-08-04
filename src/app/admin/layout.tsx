import { AdminNavigation } from "./components/AdminNavigation";
import { AdminProtection } from "./components/AdminProtection";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtection>
      <div className="min-h-screen bg-gray-50">
        <AdminNavigation />
        <div className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </AdminProtection>
  );
}

export const metadata = {
  title: "Admin Dashboard - ToolShare",
  description: "Administrative interface for ToolShare platform",
};
