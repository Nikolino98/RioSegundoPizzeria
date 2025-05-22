import type React from "react"
import { LogoutButton } from "@/components/admin/logout-button"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold text-red-700">Rio Segundo Pizzeria - Admin</h1>
          <LogoutButton />
        </div>
      </header>
      <main className="py-6">{children}</main>
    </div>
  )
}
