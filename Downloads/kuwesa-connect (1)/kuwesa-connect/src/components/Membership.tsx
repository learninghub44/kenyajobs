import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Check, CreditCard, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { createPesapalOrder } from "@/lib/pesapal";

type Step = "register" | "pay";

const KENYA_COUNTIES = [
  "Migori", "Kisii", "Homa Bay", "Nyamira", "Kisumu", "Narok", "Nakuru",
  "Nairobi", "Kiambu", "Mombasa", "Machakos", "Kajiado", "Other",
];

const MEMBERSHIP_FEE = 200;

export const Membership = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("register");
  const [busy, setBusy] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", category: "",
    institution: "", course: "", yearOfStudy: "", studentNumber: "",
    county: "", subCounty: "",
    dob: "", gender: "",
    nokName: "", nokPhone: "",
    skills: "",
  });

  const update = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const required = ["fullName", "phone", "category", "institution", "county"] as const;
    for (const f of required) {
      if (!form[f]) {
        toast({ title: "Missing details", description: `Please fill in ${f}.`, variant: "destructive" });
        return;
      }
    }
    setBusy(true);
    try {
      const data = await api.post<{ id: string }>("/members", {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || null,
        category: form.category,
        institution: form.institution,
        course: form.course || null,
        yearOfStudy: form.yearOfStudy || null,
        studentNumber: form.studentNumber || null,
        county: form.county,
        subCounty: form.subCounty || null,
        dateOfBirth: form.dob || null,
        gender: form.gender || null,
        nextOfKinName: form.nokName || null,
        nextOfKinPhone: form.nokPhone || null,
        skills: form.skills || null,
      });
      setMemberId(data.id);
      toast({ title: "Registered", description: "Now complete the KES 200 payment." });
      setStep("pay");
    } catch (e: any) {
      toast({ title: "Registration failed", description: e?.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handlePay = async () => {
    if (!memberId) return;
    setBusy(true);
    try {
      const order = await createPesapalOrder({
        purpose: "membership",
        memberId,
        amount: MEMBERSHIP_FEE,
        payerName: form.fullName,
        payerPhone: form.phone,
        payerEmail: form.email,
        description: "KUWESA Membership Fee",
      });
      window.location.href = order.redirect_url;
    } catch (e: any) {
      setBusy(false);
      toast({ title: "Payment failed to start", description: e?.message, variant: "destructive" });
    }
  };

  return (
    <section id="membership" className="section-padding bg-background">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
            Membership
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance mb-4">
            Become a <span className="text-primary">KUWESA</span> member
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Strictly for <span className="font-semibold text-foreground">students from Kuria West</span>. Pay a one-time fee of{" "}
            <span className="font-bold text-foreground">KES 200</span> via Pesapal to unlock all benefits.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          <aside className="lg:col-span-2 bg-gradient-hero rounded-3xl p-8 text-white shadow-elegant relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <Sparkles className="h-8 w-8 text-accent mb-4" />
              <h3 className="font-display text-2xl font-bold mb-2">Your journey</h3>
              <p className="text-white/80 text-sm mb-8">Two quick steps to becoming a full KUWESA member.</p>
              <ol className="space-y-4">
                {[
                  { id: "register", label: "Fill in your student details" },
                  { id: "pay", label: "Pay KES 200 via Pesapal" },
                ].map((s, i) => {
                  const order = ["register", "pay"];
                  const cur = order.indexOf(step);
                  const idx = order.indexOf(s.id);
                  const done = idx < cur;
                  const active = idx === cur;
                  return (
                    <li key={s.id} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        done ? "bg-accent text-accent-foreground"
                        : active ? "bg-white text-primary"
                        : "bg-white/20 text-white/70"
                      }`}>
                        {done ? <Check className="h-4 w-4" /> : i + 1}
                      </div>
                      <span className={`pt-1 text-sm ${active ? "font-semibold" : "text-white/80"}`}>{s.label}</span>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-10 pt-6 border-t border-white/20">
                <div className="text-white/70 text-xs uppercase tracking-wider">Membership fee</div>
                <div className="font-display text-4xl font-bold mt-1">KES <span className="text-accent">200</span></div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3 bg-card rounded-3xl p-6 sm:p-8 shadow-card border border-border/50">
            {step === "register" && (
              <form onSubmit={handleRegister} className="space-y-5 animate-fade-in">
                <h3 className="font-display text-2xl font-bold text-foreground mb-1">Registration</h3>
                <p className="text-muted-foreground text-sm mb-4">Tell us about yourself. Fields marked * are required.</p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" type="tel" placeholder="07XX XXX XXX" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="category">Membership Category *</Label>
                    <Select value={form.category} onValueChange={(v) => update("category", v)}>
                      <SelectTrigger id="category"><SelectValue placeholder="Select your category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="University Student">University Student</SelectItem>
                        <SelectItem value="College/TVET Student">College/TVET Student</SelectItem>
                        <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                        <SelectItem value="Form Four Leaver (Joining College)">Form Four Leaver (Joining College)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 sm:col-span-2 pt-2 border-t border-border/50">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Academic info</h4>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="institution">Institution *</Label>
                    <Input id="institution" placeholder="e.g. University of Nairobi" value={form.institution} onChange={(e) => update("institution", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <Input id="course" placeholder="e.g. BSc Computer Science" value={form.course} onChange={(e) => update("course", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year of Study</Label>
                    <Select value={form.yearOfStudy} onValueChange={(v) => update("yearOfStudy", v)}>
                      <SelectTrigger id="year"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["1", "2", "3", "4", "5", "6", "Graduated"].map((y) => (
                          <SelectItem key={y} value={y}>{y === "Graduated" ? y : `Year ${y}`}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="studentNumber">Student / Admission Number</Label>
                    <Input id="studentNumber" value={form.studentNumber} onChange={(e) => update("studentNumber", e.target.value)} />
                  </div>

                  <div className="space-y-2 sm:col-span-2 pt-2 border-t border-border/50">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Origin</h4>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="county">County *</Label>
                    <Select value={form.county} onValueChange={(v) => update("county", v)}>
                      <SelectTrigger id="county"><SelectValue placeholder="Select county" /></SelectTrigger>
                      <SelectContent>
                        {KENYA_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subCounty">Sub-County</Label>
                    <Input id="subCounty" placeholder="e.g. Kuria West" value={form.subCounty} onChange={(e) => update("subCounty", e.target.value)} />
                  </div>

                  <div className="space-y-2 sm:col-span-2 pt-2 border-t border-border/50">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Personal</h4>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                      <SelectTrigger id="gender"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 sm:col-span-2 pt-2 border-t border-border/50">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Next of Kin</h4>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nokName">Name</Label>
                    <Input id="nokName" value={form.nokName} onChange={(e) => update("nokName", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nokPhone">Phone</Label>
                    <Input id="nokPhone" type="tel" value={form.nokPhone} onChange={(e) => update("nokPhone", e.target.value)} />
                  </div>

                  <div className="space-y-2 sm:col-span-2 pt-2 border-t border-border/50">
                    <Label htmlFor="skills">Skills / Talents</Label>
                    <Textarea id="skills" rows={3} placeholder="e.g. Public speaking, web development, music…" value={form.skills} onChange={(e) => update("skills", e.target.value)} />
                  </div>
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full mt-2" disabled={busy}>
                  {busy ? "Registering..." : "Continue to Payment"}
                </Button>
              </form>
            )}

            {step === "pay" && (
              <div className="text-center animate-fade-in py-4">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant mb-6">
                  <CreditCard className="h-10 w-10" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">Pay Membership Fee</h3>
                <p className="text-muted-foreground mb-6">
                  You'll be redirected to Pesapal's secure checkout. M-Pesa, card and bank options supported.
                </p>
                <div className="bg-secondary rounded-2xl p-6 mb-6">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Amount due</div>
                  <div className="font-display text-5xl font-bold text-primary mt-1">KES 200</div>
                </div>
                <Button onClick={handlePay} variant="hero" size="lg" className="w-full" disabled={busy}>
                  <CreditCard className="h-5 w-5" />
                  {busy ? "Redirecting..." : "Pay with Pesapal"}
                </Button>
                <button
                  onClick={() => setStep("register")}
                  className="mt-4 text-sm text-muted-foreground hover:text-primary transition-smooth"
                >
                  Edit my details
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
