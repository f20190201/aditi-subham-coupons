import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ALLOWED = ["subhamptl00@gmail.com", "2aditi.dash@gmail.com"];
export const SHARED_PASSWORD = "123456";

const Schema = z.object({ email: z.string().email() });

export const ensureLoginUser = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Schema.parse(input))
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    if (!ALLOWED.includes(email)) {
      throw new Error("This portal is just for the two of us 💕");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Check if user already exists
    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) throw listErr;
    const existing = list.users.find((u) => u.email?.toLowerCase() === email);

    if (!existing) {
      const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: SHARED_PASSWORD,
        email_confirm: true,
      });
      if (createErr) throw createErr;
    } else {
      // Make sure password is the shared one (idempotent reset)
      await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        password: SHARED_PASSWORD,
        email_confirm: true,
      });
    }
    return { ok: true };
  });
