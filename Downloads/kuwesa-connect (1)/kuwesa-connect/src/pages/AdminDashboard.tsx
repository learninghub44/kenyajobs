import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Users, Wallet, Megaphone, UserCog, LogOut, Trash2, Plus,
  Upload, HandHeart, Eye, Receipt, Pencil,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { api } from "@/lib/api";

type Member = {
  id: string; full_name: string; phone: string; email: string | null; category: string;
  institution: string | null; course: string | null; year_of_study: string | null; student_number: string | null;
  county: string | null; sub_county: string | null; date_of_birth: string | null; gender: string | null;
  next_of_kin_name: string | null; next_of_kin_phone: string | null; skills: string | null;
  status: string; joined_at: string;
};
type Announcement = { id: string; title: string; body: string; created_at: string };
type Leader = { id: string; name: string; role: string; phone: string | null; photo_url: string | null; sort_order: number | null };
type Campaign = { id: string; title: string; description: string; beneficiary: string | null; goal_amount: number; raised_amount: number; status: string; cover_image_url: string | null; created_at: string };
type Payment = { id: string; purpose: string; payer_name: string; payer_phone: string; amount: number; status: string; merchant_reference: string; created_at: string; member_id: string | null; campaign_id: string | null };

const KENYA_COUNTIES = [
  "Migori", "Kisii", "Homa Bay", "Nyamira", "Kisumu", "Narok", "Nakuru",
  "Nairobi", "Kiambu", "Mombasa", "Machakos", "Kajiado", "Other",
];

const toRow = (obj: Record<string, any>) => {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    const snake = k.replace(/([A-Z])/g, "_$1").toLowerCase();
    out[snake] = v;
  }
  return out;
};

const BLANK_MEMBER = {
  fullName: "", phone: "", email: "", category: "",
  institution: "", course: "", yearOfStudy: "", studentNumber: "",
  county: "", subCounty: "", dob: "", gender: "",
  nokName: "", nokPhone: "", skills: "", status: "Pending Payment",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading: authLoading, isAdmin } = useAdminAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [newAnn, setNewAnn] = useState({ title: "", body: "" });
  const [newLeader, setNewLeader] = useState({ name: "", role: "", phone: "" });
  const [newCampaign, setNewCampaign] = useState({ title: "", description: "", beneficiary: "", goal_amount: "" });

  const [viewMember, setViewMember] = useState<Member | null>(null);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addMemberForm, setAddMemberForm] = useState(BLANK_MEMBER);
  const [addMemberBusy, setAddMemberBusy] = useState(false);

  const [editLeader, setEditLeader] = useState<Leader | null>(null);
  const [editLeaderForm, setEditLeaderForm] = useState({ name: "", role: "", phone: "" });
  const [editLeaderBusy, setEditLeaderBusy] = useState(false);

  const [editAnn, setEditAnn] = useState<Announcement | null>(null);
  const [editAnnForm, setEditAnnForm] = useState({ title: "", body: "" });
  const [editAnnBusy, setEditAnnBusy] = useState(false);

  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [editCampaignForm, setEditCampaignForm] = useState({ title: "", description: "", beneficiary: "", goal_amount: "" });
  const [editCampaignBusy, setEditCampaignBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/admin");
  }, [authLoading, isAdmin, navigate]);

  const refreshAll = async () => {
    const [m, a, l, c, p] = await Promise.all([
      api.get<any[]>("/members"),
      api.get<any[]>("/announcements"),
      api.get<any[]>("/leaders"),
      api.get<any[]>("/welfare/all"),
      api.get<any[]>("/payments"),
    ]);
    setMembers((m || []).map(toRow) as Member[]);
    setAnnouncements((a || []).map(toRow) as Announcement[]);
    setLeaders((l || []).map(toRow) as Leader[]);
    setCampaigns((c || []).map(toRow) as Campaign[]);
    setPayments((p || []).map(toRow) as Payment[]);
  };

  useEffect(() => { if (isAdmin) refreshAll(); }, [isAdmin]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!isAdmin) return null;

  const logout = async () => {
    await api.post("/auth/logout", {});
    navigate("/admin");
  };

  const togglePaid = async (m: Member) => {
    const next = m.status === "Paid" ? "Pending Payment" : "Paid";
    try {
      await api.patch(`/members/${m.id}/status`, { status: next });
      refreshAll();
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    }
  };

  const removeMember = async (id: string) => {
    if (!confirm("Delete this member?")) return;
    try {
      await api.delete(`/members/${id}`);
      refreshAll();
    } catch (e: any) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, phone, category, institution, county } = addMemberForm;
    if (!fullName || !phone || !category || !institution || !county) {
      toast({ title: "Missing required fields", description: "Name, phone, category, institution and county are required.", variant: "destructive" });
      return;
    }
    setAddMemberBusy(true);
    try {
      await api.post("/members", {
        fullName, phone,
        email: addMemberForm.email || null,
        category, institution,
        course: addMemberForm.course || null,
        yearOfStudy: addMemberForm.yearOfStudy || null,
        studentNumber: addMemberForm.studentNumber || null,
        county,
        subCounty: addMemberForm.subCounty || null,
        dateOfBirth: addMemberForm.dob || null,
        gender: addMemberForm.gender || null,
        nextOfKinName: addMemberForm.nokName || null,
        nextOfKinPhone: addMemberForm.nokPhone || null,
        skills: addMemberForm.skills || null,
        status: addMemberForm.status,
      });
      toast({ title: "Member added" });
      setAddMemberOpen(false);
      setAddMemberForm(BLANK_MEMBER);
      refreshAll();
    } catch (e: any) {
      toast({ title: "Failed to add member", description: e.message, variant: "destructive" });
    } finally {
      setAddMemberBusy(false);
    }
  };

  const openEditLeader = (l: Leader) => {
    setEditLeader(l);
    setEditLeaderForm({ name: l.name, role: l.role, phone: l.phone || "" });
  };

  const handleEditLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLeader) return;
    if (!editLeaderForm.name || !editLeaderForm.role) {
      toast({ title: "Name and role are required.", variant: "destructive" });
      return;
    }
    setEditLeaderBusy(true);
    try {
      await api.patch(`/leaders/${editLeader.id}`, {
        name: editLeaderForm.name,
        role: editLeaderForm.role,
        phone: editLeaderForm.phone || null,
      });
      toast({ title: "Leader updated" });
      setEditLeader(null);
      refreshAll();
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setEditLeaderBusy(false);
    }
  };

  const addAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnn.title || !newAnn.body) return;
    try {
      await api.post("/announcements", newAnn);
      setNewAnn({ title: "", body: "" });
      toast({ title: "Announcement posted" });
      refreshAll();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  const removeAnn = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    await api.delete(`/announcements/${id}`);
    refreshAll();
  };

  const openEditAnn = (a: Announcement) => {
    setEditAnn(a);
    setEditAnnForm({ title: a.title, body: a.body });
  };

  const handleEditAnn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAnn) return;
    if (!editAnnForm.title || !editAnnForm.body) {
      toast({ title: "Title and message are required.", variant: "destructive" });
      return;
    }
    setEditAnnBusy(true);
    try {
      await api.patch(`/announcements/${editAnn.id}`, editAnnForm);
      toast({ title: "Announcement updated" });
      setEditAnn(null);
      refreshAll();
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setEditAnnBusy(false);
    }
  };

  const openEditCampaign = (c: Campaign) => {
    setEditCampaign(c);
    setEditCampaignForm({
      title: c.title,
      description: c.description,
      beneficiary: c.beneficiary || "",
      goal_amount: String(c.goal_amount),
    });
  };

  const handleEditCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCampaign) return;
    if (!editCampaignForm.title || !editCampaignForm.description) {
      toast({ title: "Title and description are required.", variant: "destructive" });
      return;
    }
    setEditCampaignBusy(true);
    try {
      await api.patch(`/welfare/${editCampaign.id}`, {
        title: editCampaignForm.title,
        description: editCampaignForm.description,
        beneficiary: editCampaignForm.beneficiary || null,
        goalAmount: Number(editCampaignForm.goal_amount) || 0,
      });
      toast({ title: "Campaign updated" });
      setEditCampaign(null);
      refreshAll();
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setEditCampaignBusy(false);
    }
  };

  const addLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeader.name || !newLeader.role) return;
    try {
      await api.post("/leaders", {
        name: newLeader.name, role: newLeader.role, phone: newLeader.phone || null,
        sortOrder: leaders.length + 1,
      });
      setNewLeader({ name: "", role: "", phone: "" });
      toast({ title: "Leader added" });
      refreshAll();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  const removeLeader = async (id: string) => {
    if (!confirm("Delete this leader?")) return;
    await api.delete(`/leaders/${id}`);
    refreshAll();
  };

  const uploadLeaderPhoto = async (id: string, file: File) => {
    if (!file.type.startsWith("image/")) return toast({ title: "Invalid file", variant: "destructive" });
    if (file.size > 5_000_000) return toast({ title: "Too large", description: "Max 5MB.", variant: "destructive" });
    try {
      await api.uploadPhoto(id, file);
      toast({ title: "Photo updated" });
      refreshAll();
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    }
  };

  const removeLeaderPhoto = async (id: string) => {
    await api.patch(`/leaders/${id}/photo`, {});
    refreshAll();
  };

  const addCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.title || !newCampaign.description) return;
    try {
      await api.post("/welfare", {
        title: newCampaign.title,
        description: newCampaign.description,
        beneficiary: newCampaign.beneficiary || null,
        goalAmount: Number(newCampaign.goal_amount) || 0,
      });
      setNewCampaign({ title: "", description: "", beneficiary: "", goal_amount: "" });
      toast({ title: "Campaign posted" });
      refreshAll();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  const toggleCampaignStatus = async (c: Campaign) => {
    await api.patch(`/welfare/${c.id}/status`, { status: c.status === "active" ? "closed" : "active" });
    refreshAll();
  };

  const removeCampaign = async (id: string) => {
    if (!confirm("Delete this campaign? Past contributions will be kept.")) return;
    await api.delete(`/welfare/${id}`);
    refreshAll();
  };

  const paidCount = members.filter((m) => m.status === "Paid").length;
  const membershipRevenue = paidCount * 200;
  const welfareRaised = payments.filter((p) => p.purpose === "welfare" && p.status === "COMPLETED")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      <main className="container-custom px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Live data from your database.</p>
          </div>
          <Button variant="outline" onClick={logout}><LogOut className="h-4 w-4 mr-2" /> Sign out</Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Total Members", value: members.length },
            { icon: Wallet, label: "Paid Members", value: paidCount },
            { icon: Receipt, label: "Membership Revenue (KES)", value: membershipRevenue.toLocaleString() },
            { icon: HandHeart, label: "Welfare Raised (KES)", value: welfareRaised.toLocaleString() },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
              <div className="inline-flex h-10 w-10 rounded-xl bg-gradient-primary text-primary-foreground items-center justify-center mb-3">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-display font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="members"><Users className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Members</span></TabsTrigger>
            <TabsTrigger value="payments"><Receipt className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Payments</span></TabsTrigger>
            <TabsTrigger value="welfare"><HandHeart className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Welfare</span></TabsTrigger>
            <TabsTrigger value="announcements"><Megaphone className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Posts</span></TabsTrigger>
            <TabsTrigger value="leadership"><UserCog className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Leaders</span></TabsTrigger>
          </TabsList>

          {/* MEMBERS */}
          <TabsContent value="members" className="mt-6">
            <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">Registered Members</h3>
                <Button size="sm" variant="hero" onClick={() => setAddMemberOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Member
                </Button>
              </div>
              {members.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground text-sm">No members yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Institution</TableHead>
                      <TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {members.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">{m.full_name}</TableCell>
                          <TableCell>{m.phone}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{m.institution || "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{m.category}</TableCell>
                          <TableCell>
                            <Badge className={m.status === "Paid" ? "bg-primary/10 text-primary hover:bg-primary/20" : "bg-accent/20 text-accent-foreground hover:bg-accent/30"}>
                              {m.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button size="sm" variant="ghost" onClick={() => setViewMember(m)}><Eye className="h-4 w-4" /></Button>
                            <Button size="sm" variant="outline" onClick={() => togglePaid(m)}>
                              {m.status === "Paid" ? "Unpaid" : "Mark Paid"}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => removeMember(m.id)}><Trash2 className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* View member detail */}
            <Dialog open={!!viewMember} onOpenChange={(o) => !o && setViewMember(null)}>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>{viewMember?.full_name}</DialogTitle></DialogHeader>
                {viewMember && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    {([
                      ["Phone", viewMember.phone], ["Email", viewMember.email],
                      ["Category", viewMember.category],
                      ["Institution", viewMember.institution], ["Course", viewMember.course],
                      ["Year", viewMember.year_of_study], ["Student No.", viewMember.student_number],
                      ["County", viewMember.county], ["Sub-county", viewMember.sub_county],
                      ["DOB", viewMember.date_of_birth], ["Gender", viewMember.gender],
                      ["Next of kin", viewMember.next_of_kin_name], ["NOK Phone", viewMember.next_of_kin_phone],
                      ["Status", viewMember.status],
                      ["Joined", new Date(viewMember.joined_at).toLocaleString()],
                    ] as [string, string | null][]).map(([k, v]) => (
                      <div key={k}>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">{k}</div>
                        <div className="font-medium text-foreground">{v || "—"}</div>
                      </div>
                    ))}
                    {viewMember.skills && (
                      <div className="col-span-2">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Skills</div>
                        <div className="font-medium text-foreground">{viewMember.skills}</div>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Add member dialog */}
            <Dialog open={addMemberOpen} onOpenChange={(o) => { setAddMemberOpen(o); if (!o) setAddMemberForm(BLANK_MEMBER); }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Add Member Manually</DialogTitle></DialogHeader>
                <form onSubmit={handleAddMember} className="space-y-4 pt-2">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Full Name *</Label>
                      <Input value={addMemberForm.fullName} onChange={(e) => setAddMemberForm((s) => ({ ...s, fullName: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone *</Label>
                      <Input type="tel" placeholder="07XX XXX XXX" value={addMemberForm.phone} onChange={(e) => setAddMemberForm((s) => ({ ...s, phone: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={addMemberForm.email} onChange={(e) => setAddMemberForm((s) => ({ ...s, email: e.target.value }))} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Category *</Label>
                      <Select value={addMemberForm.category} onValueChange={(v) => setAddMemberForm((s) => ({ ...s, category: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="University Student">University Student</SelectItem>
                          <SelectItem value="College/TVET Student">College/TVET Student</SelectItem>
                          <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                          <SelectItem value="Form Four Leaver (Joining College)">Form Four Leaver (Joining College)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Institution *</Label>
                      <Input placeholder="e.g. University of Nairobi" value={addMemberForm.institution} onChange={(e) => setAddMemberForm((s) => ({ ...s, institution: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Course</Label>
                      <Input value={addMemberForm.course} onChange={(e) => setAddMemberForm((s) => ({ ...s, course: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Year of Study</Label>
                      <Select value={addMemberForm.yearOfStudy} onValueChange={(v) => setAddMemberForm((s) => ({ ...s, yearOfStudy: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {["1","2","3","4","5","6","Graduated"].map((y) => (
                            <SelectItem key={y} value={y}>{y === "Graduated" ? y : `Year ${y}`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>County *</Label>
                      <Select value={addMemberForm.county} onValueChange={(v) => setAddMemberForm((s) => ({ ...s, county: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                        <SelectContent>
                          {KENYA_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Sub-County</Label>
                      <Input value={addMemberForm.subCounty} onChange={(e) => setAddMemberForm((s) => ({ ...s, subCounty: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input type="date" value={addMemberForm.dob} onChange={(e) => setAddMemberForm((s) => ({ ...s, dob: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select value={addMemberForm.gender} onValueChange={(v) => setAddMemberForm((s) => ({ ...s, gender: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Status</Label>
                      <Select value={addMemberForm.status} onValueChange={(v) => setAddMemberForm((s) => ({ ...s, status: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending Payment">Pending Payment</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2 pt-2 border-t border-border/50">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Next of Kin</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Next of Kin Name</Label>
                      <Input value={addMemberForm.nokName} onChange={(e) => setAddMemberForm((s) => ({ ...s, nokName: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Next of Kin Phone</Label>
                      <Input type="tel" value={addMemberForm.nokPhone} onChange={(e) => setAddMemberForm((s) => ({ ...s, nokPhone: e.target.value }))} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Skills / Talents</Label>
                      <Textarea rows={2} value={addMemberForm.skills} onChange={(e) => setAddMemberForm((s) => ({ ...s, skills: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setAddMemberOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="hero" className="flex-1" disabled={addMemberBusy}>
                      {addMemberBusy ? "Adding..." : "Add Member"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* PAYMENTS */}
          <TabsContent value="payments" className="mt-6">
            <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
              <div className="p-5 border-b border-border"><h3 className="font-display text-lg font-bold">All Payments (last 200)</h3></div>
              {payments.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground text-sm">No payments yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Date</TableHead><TableHead>Payer</TableHead><TableHead>Phone</TableHead>
                      <TableHead>Purpose</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Ref</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</TableCell>
                          <TableCell className="font-medium">{p.payer_name}</TableCell>
                          <TableCell>{p.payer_phone}</TableCell>
                          <TableCell className="capitalize">{p.purpose}</TableCell>
                          <TableCell>KES {Number(p.amount).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={
                              p.status === "COMPLETED" ? "bg-primary/10 text-primary"
                              : p.status === "PENDING" ? "bg-accent/20 text-accent-foreground"
                              : "bg-destructive/10 text-destructive"
                            }>{p.status}</Badge>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">{p.merchant_reference.slice(0, 8)}…</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* WELFARE */}
          <TabsContent value="welfare" className="mt-6 grid lg:grid-cols-2 gap-6">
            <form onSubmit={addCampaign} className="bg-card rounded-2xl p-6 shadow-card border border-border/50 space-y-4">
              <h3 className="font-display text-lg font-bold">New Welfare Case</h3>
              <div className="space-y-2">
                <Label htmlFor="c-title">Title</Label>
                <Input id="c-title" value={newCampaign.title} onChange={(e) => setNewCampaign((s) => ({ ...s, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-ben">Beneficiary (optional)</Label>
                <Input id="c-ben" placeholder="e.g. Jane M." value={newCampaign.beneficiary} onChange={(e) => setNewCampaign((s) => ({ ...s, beneficiary: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-desc">Description</Label>
                <Textarea id="c-desc" rows={4} value={newCampaign.description} onChange={(e) => setNewCampaign((s) => ({ ...s, description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-goal">Goal (KES)</Label>
                <Input id="c-goal" type="number" min={0} value={newCampaign.goal_amount} onChange={(e) => setNewCampaign((s) => ({ ...s, goal_amount: e.target.value }))} />
              </div>
              <Button type="submit" variant="hero" className="w-full"><Plus className="h-4 w-4 mr-1" /> Post Campaign</Button>
            </form>

            <div className="space-y-3">
              {campaigns.length === 0 ? (
                <div className="bg-card rounded-2xl p-12 text-center text-muted-foreground text-sm border border-border/50">No welfare campaigns yet.</div>
              ) : campaigns.map((c) => {
                const pct = c.goal_amount > 0 ? Math.min(100, Math.round((Number(c.raised_amount) / Number(c.goal_amount)) * 100)) : 0;
                return (
                  <div key={c.id} className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="font-display font-bold text-foreground">{c.title}</h4>
                        {c.beneficiary && <div className="text-xs text-primary">For: {c.beneficiary}</div>}
                      </div>
                      <Badge className={c.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}>{c.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{c.description}</p>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold">KES {Number(c.raised_amount).toLocaleString()}</span>
                      <span className="text-muted-foreground">of KES {Number(c.goal_amount).toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-gradient-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => openEditCampaign(c)}>
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleCampaignStatus(c)}>
                        {c.status === "active" ? "Close" : "Reopen"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeCampaign(c.id)} className="ml-auto text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* ANNOUNCEMENTS */}
          <TabsContent value="announcements" className="mt-6 grid lg:grid-cols-2 gap-6">
            <form onSubmit={addAnnouncement} className="bg-card rounded-2xl p-6 shadow-card border border-border/50 space-y-4">
              <h3 className="font-display text-lg font-bold">New Announcement</h3>
              <div className="space-y-2">
                <Label htmlFor="ann-title">Title</Label>
                <Input id="ann-title" value={newAnn.title} onChange={(e) => setNewAnn((s) => ({ ...s, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ann-body">Message</Label>
                <Textarea id="ann-body" rows={5} value={newAnn.body} onChange={(e) => setNewAnn((s) => ({ ...s, body: e.target.value }))} />
              </div>
              <Button type="submit" variant="hero" className="w-full"><Plus className="h-4 w-4 mr-1" /> Post Announcement</Button>
            </form>
            <div className="space-y-3">
              {announcements.length === 0 ? (
                <div className="bg-card rounded-2xl p-12 text-center text-muted-foreground text-sm border border-border/50">No announcements yet.</div>
              ) : announcements.map((a) => (
                <div key={a.id} className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-bold text-foreground">{a.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{a.body}</p>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => openEditAnn(a)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => removeAnn(a.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* LEADERSHIP */}
          <TabsContent value="leadership" className="mt-6 grid lg:grid-cols-2 gap-6">
            <form onSubmit={addLeader} className="bg-card rounded-2xl p-6 shadow-card border border-border/50 space-y-4">
              <h3 className="font-display text-lg font-bold">Add Leader</h3>
              <div className="space-y-2">
                <Label htmlFor="l-name">Name</Label>
                <Input id="l-name" value={newLeader.name} onChange={(e) => setNewLeader((s) => ({ ...s, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="l-role">Role / Position</Label>
                <Input id="l-role" value={newLeader.role} onChange={(e) => setNewLeader((s) => ({ ...s, role: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="l-phone">Phone (optional)</Label>
                <Input id="l-phone" type="tel" value={newLeader.phone} onChange={(e) => setNewLeader((s) => ({ ...s, phone: e.target.value }))} />
              </div>
              <Button type="submit" variant="hero" className="w-full"><Plus className="h-4 w-4 mr-1" /> Add Leader</Button>
            </form>

            <div className="space-y-3">
              {leaders.length === 0 ? (
                <div className="bg-card rounded-2xl p-12 text-center text-muted-foreground text-sm border border-border/50">No leaders yet.</div>
              ) : leaders.map((l) => (
                <div key={l.id} className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
                      {l.photo_url ? <img src={l.photo_url} alt={l.name} className="h-full w-full object-cover" /> : l.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-foreground">{l.name}</div>
                      <div className="text-sm text-primary">{l.role}</div>
                      {l.phone && <div className="text-xs text-muted-foreground">{l.phone}</div>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => openEditLeader(l)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <label className="cursor-pointer">
                      <Button size="sm" variant="outline" asChild>
                        <span><Upload className="h-3.5 w-3.5 mr-1" /> Photo</span>
                      </Button>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadLeaderPhoto(l.id, f);
                      }} />
                    </label>
                    {l.photo_url && (
                      <Button size="sm" variant="ghost" onClick={() => removeLeaderPhoto(l.id)}>Remove photo</Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => removeLeader(l.id)} className="ml-auto text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Leader Dialog */}
      <Dialog open={!!editLeader} onOpenChange={(o) => !o && setEditLeader(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit Leader</DialogTitle></DialogHeader>
          <form onSubmit={handleEditLeader} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editLeaderForm.name} onChange={(e) => setEditLeaderForm((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Role / Position</Label>
              <Input value={editLeaderForm.role} onChange={(e) => setEditLeaderForm((s) => ({ ...s, role: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Phone (optional)</Label>
              <Input type="tel" value={editLeaderForm.phone} onChange={(e) => setEditLeaderForm((s) => ({ ...s, phone: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditLeader(null)}>Cancel</Button>
              <Button type="submit" variant="hero" className="flex-1" disabled={editLeaderBusy}>
                {editLeaderBusy ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Announcement Dialog */}
      <Dialog open={!!editAnn} onOpenChange={(o) => !o && setEditAnn(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Announcement</DialogTitle></DialogHeader>
          <form onSubmit={handleEditAnn} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={editAnnForm.title} onChange={(e) => setEditAnnForm((s) => ({ ...s, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea rows={5} value={editAnnForm.body} onChange={(e) => setEditAnnForm((s) => ({ ...s, body: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditAnn(null)}>Cancel</Button>
              <Button type="submit" variant="hero" className="flex-1" disabled={editAnnBusy}>
                {editAnnBusy ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Dialog */}
      <Dialog open={!!editCampaign} onOpenChange={(o) => !o && setEditCampaign(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Welfare Campaign</DialogTitle></DialogHeader>
          <form onSubmit={handleEditCampaign} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={editCampaignForm.title} onChange={(e) => setEditCampaignForm((s) => ({ ...s, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Beneficiary (optional)</Label>
              <Input placeholder="e.g. Jane M." value={editCampaignForm.beneficiary} onChange={(e) => setEditCampaignForm((s) => ({ ...s, beneficiary: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={4} value={editCampaignForm.description} onChange={(e) => setEditCampaignForm((s) => ({ ...s, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Goal (KES)</Label>
              <Input type="number" min={0} value={editCampaignForm.goal_amount} onChange={(e) => setEditCampaignForm((s) => ({ ...s, goal_amount: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditCampaign(null)}>Cancel</Button>
              <Button type="submit" variant="hero" className="flex-1" disabled={editCampaignBusy}>
                {editCampaignBusy ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
