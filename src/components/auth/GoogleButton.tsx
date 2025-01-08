import { Button } from "../ui/button";
import { useState } from "react";
import Image from "next/image";
import { googleLogin } from "@/actions/auth-actions";
import { Loader2 } from "lucide-react";

function GoogleButten() {
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
      <Image src="/google.svg" alt="Google Logo" width={18} height={18} />
      Continue with Google
    </Button>
  );
}

export default GoogleButten;
