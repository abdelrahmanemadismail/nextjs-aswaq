import { Button } from "../ui/button";
import { useState } from "react";
import Image from "next/image";
import { googleLogin } from "@/actions/auth-actions";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

function GoogleButton() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const GoogleLogin = async () => {
    setIsLoading(true);
    await googleLogin();
  };

  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full"
      onClick={GoogleLogin}
      disabled={isLoading}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      <Image src="/google.svg" alt={t.auth.googleLogo} width={18} height={18} />
      {t.auth.continueWithGoogle}
    </Button>
  );
}

export default GoogleButton;