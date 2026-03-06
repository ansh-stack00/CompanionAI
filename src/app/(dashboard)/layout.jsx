import Sidebar from "@/components/layout/sidebar"

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <main className="flex-1 md:ml-64 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}