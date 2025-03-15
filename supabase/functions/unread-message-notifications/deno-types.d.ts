// supabase/functions/deno-types.d.ts
declare module "https://deno.land/std@0.177.0/http/server.ts" {
    export function serve(handler: (req: Request) => Response | Promise<Response>): void;
  }
  
  declare module "https://esm.sh/@supabase/supabase-js@2.7.1" {
    export * from "@supabase/supabase-js";
  }
  
  declare module "https://esm.sh/nodemailer@6.9.3" {
    export * from "nodemailer";
  }