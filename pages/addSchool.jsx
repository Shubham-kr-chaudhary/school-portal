import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/router";

export default function AddSchool() {
  const { register, handleSubmit, reset } = useForm();
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("name", data.name || "");
      formData.append("address", data.address || "");
      formData.append("city", data.city || "");
      formData.append("state", data.state || "");
      formData.append("contact", data.contact || "");
      formData.append("email_id", data.email_id || "");
      if (data.image && data.image[0]) formData.append("image", data.image[0]);

      const res = await axios.post("/api/schools", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 201 || res.status === 200) {
        setSaved(true);        
        reset();
        setPreview(null);
      } else {
        alert("Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="sp-page-container">
      <div className="sp-card-wrapper">
        <h1 className="sp-page-heading">Add New School</h1>

        {saved && (
          <div className="sp-banner" role="status" aria-live="polite">
            <div>Saved successfully.</div>
            <div className="sp-banner-actions">
              <button
                onClick={() => router.push("/showSchools")}
                className="sp-btn sp-btn-primary"
              >
                View Schools
              </button>
              <button
                onClick={() => setSaved(false)}
                className="sp-btn sp-btn-ghost"
              >
                Stay
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="sp-form">
          <input
            {...register("name")}
            placeholder="School Name"
            className="sp-input"
            required
          />
          <input {...register("address")} placeholder="Address" className="sp-input" />
          <div className="sp-grid-2">
            <input {...register("city")} placeholder="City" className="sp-input" />
            <input {...register("state")} placeholder="State" className="sp-input" />
          </div>

          <input {...register("contact")} placeholder="Contact Number" className="sp-input" />
          <input {...register("email_id")} placeholder="Email" className="sp-input" />

          <div>
            <label className="sp-label">Image (optional)</label>
            <input
              type="file"
              {...register("image")}
              onChange={(e) => {
                handlePreview(e);
              }}
              accept="image/*"
              className="sp-file"
            />
          </div>

          {preview && (
            <div className="sp-preview">
              <img src={preview} alt="preview" className="sp-preview-img" />
            </div>
          )}

          <div className="sp-actions">
            <button
              type="submit"
              disabled={submitting}
              className="sp-btn sp-btn-primary full"
            >
              {submitting ? "Saving..." : "Save School"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/showSchools")}
              className="sp-btn sp-btn-outline"
            >
              View
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
