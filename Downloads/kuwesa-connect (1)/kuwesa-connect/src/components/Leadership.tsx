import { Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import agreyPhoto from "@/assets/leader-agrey.png";
import sharonPhoto from "@/assets/leader-sharon.png";
import { api } from "@/lib/api";

type Leader = {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  photo_url: string | null;
};

const fallbackLeaders: Leader[] = [
  { id: "1", name: "AGREY CHACHA", role: "President", phone: "+254745523865", photo_url: agreyPhoto },
  { id: "2", name: "SHARON ATIEGO", role: "Vice President", phone: "", photo_url: sharonPhoto },
];

const seededPhotoFor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("agrey")) return agreyPhoto;
  if (n.includes("sharon")) return sharonPhoto;
  return null;
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

export const Leadership = () => {
  const [leaders, setLeaders] = useState<Leader[]>(fallbackLeaders);

  useEffect(() => {
    let active = true;
    api.get<any[]>("/leaders").then((data) => {
      if (!active || !data || data.length === 0) return;
      setLeaders(
        data.map((l) => ({
          id: l.id,
          name: l.name,
          role: l.role,
          phone: l.phone ?? null,
          photo_url: l.photoUrl ?? l.photo_url ?? seededPhotoFor(l.name),
        }))
      );
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <section id="leadership" className="section-padding bg-gradient-soft">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
            Our Team
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance mb-4">
            Meet the <span className="text-primary">Leadership</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            The student leaders steering KUWESA forward.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {leaders.map((l) => (
            <div
              key={l.id}
              className="group bg-card rounded-3xl p-8 shadow-card hover:shadow-elegant transition-smooth border border-border/50 text-center hover:-translate-y-1"
            >
              <div className="relative inline-block mb-5">
                <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-smooth" />
                <div className="relative h-32 w-32 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-elegant ring-4 ring-background overflow-hidden">
                  {l.photo_url ? (
                    <img src={l.photo_url} alt={`${l.name}, ${l.role} of KUWESA`} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <span className="font-display text-4xl font-bold">{getInitials(l.name)}</span>
                  )}
                </div>
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">{l.name}</h3>
              <p className="text-primary font-semibold text-sm mt-1 mb-4">{l.role}</p>

              {l.phone ? (
                <a
                  href={`tel:${l.phone}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm hover:bg-primary hover:text-primary-foreground transition-smooth"
                >
                  <Phone className="h-4 w-4" />
                  {l.phone}
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-muted-foreground text-sm">
                  <User className="h-4 w-4" />
                  Contact via President
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
