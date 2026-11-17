import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AdminEntry() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login/admin/management");
  }, [router]);

  return null;
}
