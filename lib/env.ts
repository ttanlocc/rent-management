import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    },
    client: {
        NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    },
    // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
    runtimeEnv: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    // For Next.js >= 13.4.4, you only need to destructure client variables:
    // experimental__runtimeEnv: {
    //   NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    //   NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    // }
});
