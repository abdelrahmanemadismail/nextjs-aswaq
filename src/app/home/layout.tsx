import BreadcrumbNav from "@/components/BreadcrumbNav";
import Header from "@/components/Header";
import CategoryBar from "@/components/CategoryBar";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Header />
        <CategoryBar />
      </div>
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <BreadcrumbNav />
      </div>
        {children}
      </div>
    </div>
  );
}
