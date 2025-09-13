import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function ShowSchools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  async function logout() {
    try {
      await axios.post("/api/auth/logout");
      setIsLoggedIn(false);
   
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  useEffect(() => {
 
    let mounted = true;

    async function fetchAll() {
      setLoading(true);
      try {
      
        const authReq = axios.get("/api/auth/me").catch(() => ({ data: { authenticated: false } }));
        const schoolsReq = axios.get("/api/schools").catch((e) => {
          console.error("Error fetching schools:", e);
          return { data: [] };
        });

        const [authRes, schoolsRes] = await Promise.all([authReq, schoolsReq]);

        if (!mounted) return;

        setIsLoggedIn(Boolean(authRes?.data?.authenticated));
        setSchools(schoolsRes?.data || []);
      } catch (err) {
        console.error("Error loading data:", err);
        if (mounted) {
          setIsLoggedIn(false);
          setSchools([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchAll();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="sp-page-wrapper">
      <div className="sp-header">
        <h2 className="sp-title">All Schools</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => {
              if (!isLoggedIn) {
                
                router.push("/login");
                return;
              }
              router.push("/addSchool");
            }}
            className="sp-btn sp-btn-primary"
          >
            + Add School
          </button>

       
          {isLoggedIn ? (
            <button onClick={logout} className="sp-btn sp-btn-ghost">
              Logout
            </button>
          ) : (
       
            <button onClick={() => router.push("/login")} className="sp-btn sp-btn-outline">
              Login
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="sp-note">Loading…</div>
      ) : schools.length === 0 ? (
        <div className="sp-note">No schools yet. Add one from the Add School page.</div>
      ) : (
        <div className="sp-grid">
          {schools.map((s) => (
            <article key={s.id} className="sp-card">
              <div className="sp-img-wrap">
                {s.image ? (
                  <img src={s.image} alt={s.name || "school image"} className="sp-thumb" />
                ) : (
                  <div className="sp-no-image">No Image</div>
                )}
              </div>

              <div className="sp-card-body">
                <h3 className="sp-card-title">{s.name}</h3>
                <p className="sp-muted">{[s.address, s.city, s.state].filter(Boolean).join(", ")}</p>

                <div className="sp-meta">
                  {s.contact && <div>📞 {s.contact}</div>}
                  {s.email_id && <div>✉️ {s.email_id}</div>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
