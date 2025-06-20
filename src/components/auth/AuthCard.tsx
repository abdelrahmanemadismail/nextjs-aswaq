import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/hooks/use-translation";

export default function AuthCard({ children, title="Continue to ASWAQ" }: { children: React.ReactNode, title: string }) {
  const { t, getLocalizedPath } = useTranslation();
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="flex justify-center py-4">
          <Link href={getLocalizedPath("/")}>
            <Image src="/logo.svg" alt={t.common.aswaqOnline} width={150} height={120} />
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
          {t.auth.agreementPrefix}
          <div>
            <Link
              className="text-primary2 underline-offset-4 hover:underline px-1 text-xs"
              href={getLocalizedPath("/terms-of-service")}
            >
              {t.footer.termsOfService}
            </Link>
            {t.auth.agreementConnector}
            <Link
              className="text-primary2 underline-offset-4 hover:underline px-1 text-xs"
              href={getLocalizedPath("/privacy-policy")}
            >
              {t.footer.privacyPolicy}
            </Link>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}