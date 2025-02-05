import { Metadata } from "next"
import Header from "@/components/Header"
import CategoryBar from "@/components/CategoryBar"

export const metadata: Metadata = {
  title: "Chat | Aswaq",
  description: "Chat with buyers and sellers on Aswaq",
}

interface ChatLayoutProps {
  children: React.ReactNode
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CategoryBar />
      
      <main className="container mx-auto py-6">
        <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-lg border bg-background shadow">
          {children}
        </div>
      </main>
    </div>
  )
}