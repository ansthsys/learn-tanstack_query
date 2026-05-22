import { Outlet } from "react-router"
import Navbar from "@/components/organisms/Navbar"

function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 p-4">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
