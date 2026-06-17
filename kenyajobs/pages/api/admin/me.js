import { isAdminRequest } from "@/lib/adminAuth";

export default function handler(req, res) {
  res.status(200).json({ authenticated: isAdminRequest(req) });
}
