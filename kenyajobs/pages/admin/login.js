import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function LegacyAdminLoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login/admin/management");
  }, [router]);
  return <><Head><meta name="robots" content="noindex,nofollow,noarchive" /></Head><main className="min-h-[50vh] flex items-center justify-center text-sm text-gray-500">Opening secure admin sign-in…</main></>;
}
