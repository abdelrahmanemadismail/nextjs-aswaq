import BreadcrumbNav from "@/components/BreadcrumbNav";
import Header from "@/components/Header";
import CategoryBar from "@/components/CategoryBar";

export default function DashboardLayout({
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
      <div className="container flex flex-col items-center justify-center mx-auto w-screen mt-10">
        <div className="flex flex-col items-start w-full">
          <BreadcrumbNav />
        </div>
        {children}
      </div>
    </div>
  );
}
