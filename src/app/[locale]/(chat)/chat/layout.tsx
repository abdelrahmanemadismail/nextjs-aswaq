// app/(chat)/chat/layout.tsx
import { Metadata } from "next"
import Header from "@/components/Header"
import CategoryBar from "@/components/CategoryBar"
import Footer from "@/components/Footer"

export const metadata: Metadata = {
  title: "Chat | Aswaq",
  description: "Chat with buyers and sellers on Aswaq",
}

interface ChatLayoutProps {
  children: React.ReactNode
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Header />
        <CategoryBar />
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-lg border bg-background shadow">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}