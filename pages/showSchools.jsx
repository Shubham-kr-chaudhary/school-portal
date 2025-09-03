import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function ShowSchools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/schools");
        setSchools(res.data || []);
      } catch (err) {
        console.error("Error fetching schools:", err);
        setSchools([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="sp-page-wrapper">
      <div className="sp-header">
        <h2 className="sp-title">All Schools</h2>
        <div>
          <button onClick={() => router.push("/addSchool")} className="sp-btn sp-btn-primary">
            + Add School
          </button>
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
                <p className="sp-muted">
                  {[s.address, s.city, s.state].filter(Boolean).join(", ")}
                </p>

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
