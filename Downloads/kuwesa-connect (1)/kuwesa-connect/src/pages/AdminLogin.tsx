import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/auth/login", { email: creds.email.trim(), password: creds.password });
      toast({ title: "Welcome back, Admin" });
      navigate("/admin/dashboard");
    } catch (err: any) {
      toast({ title: "Login failed", description: err?.message || "Invalid credentials", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      <main className="flex items-center justify-center px-4 pt-32 pb-16">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md bg-card rounded-3xl shadow-elegant p-8 border border-border/50 animate-scale-in"
        >
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-glow">
              <Lock className="h-8 w-8" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-center text-foreground mb-2">Admin Login</h1>
          <p className="text-center text-muted-foreground text-sm mb-6">
            Sign in to manage KUWESA.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" value={creds.email} onChange={(e) => setCreds((s) => ({ ...s, email: e.target.value }))} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p">Password</Label>
              <Input id="p" type="password" autoComplete="current-password" value={creds.password} onChange={(e) => setCreds((s) => ({ ...s, password: e.target.value }))} placeholder="••••••••" />
            </div>
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full mt-6" disabled={busy}>
            {busy ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default AdminLogin;
