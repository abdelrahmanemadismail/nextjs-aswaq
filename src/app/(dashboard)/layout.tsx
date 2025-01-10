import BreadcrumbNav from "@/components/BreadcrumbNav";

export default function DashboardLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <div className="flex items-start w-full">
              <BreadcrumbNav />
            </div>
            {children}
          </div>
        </div>
      </div>
    );
  }
  