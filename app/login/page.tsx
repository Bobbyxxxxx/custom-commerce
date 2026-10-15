import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import LoginForm from "@/components/LoginForm";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  // Already signed in
  if (data?.claims) redirect("/");
 
  return (
    <div>
      <Navbar />
      <LoginForm />
    </div>
  );
}
