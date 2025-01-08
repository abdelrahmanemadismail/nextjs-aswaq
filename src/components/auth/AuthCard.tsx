import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AuthCard({ children, title="Continue to ASWAQ" }: { children: React.ReactNode, title: string }) {
  const router = useRouter();
  return (
<Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="flex justify-center py-4">
          <Link href="/">
            <Image src="/logo.svg" alt="Aswaq Online" width={150} height={120} />
          </Link>
        </CardTitle>
        <CardDescription className="text-center">
          {title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      <CardFooter className="flex justify-center">
      <div className="text-balance text-center text-xs text-muted-foreground">
          By clicking continue, you agree to our
          <div>
            <Button
              variant="link"
              className="px-1 text-xs"
            onClick={() => router.push("/auth/terms-of-service")}
          >
            Terms of Service
          </Button>
          and
          <Button
            variant="link"
            className="px-1 text-xs"
            onClick={() => router.push("/auth/privacy-policy")}
          >
            Privacy Policy
          </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}