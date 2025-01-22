// app/admin/categories/page.tsx
import { CategoriesPage } from "@/components/admin/categories/CategoriesPage"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Categories | Admin",
  description: "Manage your marketplace categories",
}

export default function Page() {
  return <CategoriesPage />
}