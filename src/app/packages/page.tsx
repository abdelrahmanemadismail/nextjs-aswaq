import CategoryBar from "@/components/CategoryBar";
import PackageList from "@/components/checkout/PackageList";
import Footer from "@/components/Footer";
import Header from "@/components/Header";


export default function PackagesPage() {

    return (
        <div className="flex min-h-screen flex-col">
            <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Header />
                <CategoryBar />
            </div>
            <PackageList />
            <Footer />
        </div>
    );
}