import { Outlet } from "react-router-dom"
import { Header } from "./Header"
import { MobileNav } from "./MobileNav"

export function RootLayout() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 md:px-6 md:pb-10">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  )
}
