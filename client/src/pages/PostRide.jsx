import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import styles from "./PostRide.module.css";

export default function PostRide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    from: "", to: "", departureTime: "",
    totalSeats: "1", fare: "",
    vehicleType: "", vehicleModel: "", vehicleNumber: "",
    description: "",
  });

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const minDateTime = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.departureTime) <= new Date()) {
      return toast.error("Departure time must be in the future");
    }
    setLoading(true);
    try {
      const payload = {
        from: form.from,
        to: form.to,
        departureTime: form.departureTime,
        totalSeats: Number(form.totalSeats),
        fare: Number(form.fare),
        vehicle: {
          type: form.vehicleType,
          model: form.vehicleModel,
          number: form.vehicleNumber,
        },
        description: form.description,
      };
      const res = await api.post("/rides", payload);
      toast.success("Ride posted successfully!");
      navigate(`/rides/${res.data.ride._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post ride");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Post a ride</h1>
        <p className={styles.subtitle}>
          Got empty seats? Let fellow students join you and split the cost.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Route */}
        <div className="card">
          <h2 className={styles.sectionLabel}>Route details</h2>
          <div className={styles.grid2}>
            <div className="form-group">
              <label className="form-label">From</label>
              <input className="form-input" placeholder="Starting point (e.g. GIDC Gate)" value={form.from} onChange={set("from")} required />
            </div>
            <div className="form-group">
              <label className="form-label">To</label>
              <input className="form-input" placeholder="Destination (e.g. City Bus Stand)" value={form.to} onChange={set("to")} required />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Departure time</label>
            <input
              className="form-input"
              type="datetime-local"
              min={minDateTime}
              value={form.departureTime}
              onChange={set("departureTime")}
              required
              style={{ maxWidth: 300 }}
            />
          </div>
        </div>

        {/* Seats & fare */}
        <div className="card">
          <h2 className={styles.sectionLabel}>Seats & fare</h2>
          <div className={styles.grid2}>
            <div className="form-group">
              <label className="form-label">Seats available</label>
              <select className="form-input" value={form.totalSeats} onChange={set("totalSeats")}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n} seat{n > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Fare per seat (₹)</label>
              <input
                className="form-input"
                type="number"
                min={0}
                placeholder="e.g. 25"
                value={form.fare}
                onChange={set("fare")}
                required
              />
            </div>
          </div>
          <p className="text-muted" style={{ marginTop: 8 }}>
            Payment is collected in cash from each passenger at pickup.
          </p>
        </div>

        {/* Vehicle */}
        <div className="card">
          <h2 className={styles.sectionLabel}>Vehicle info <span style={{ color: "var(--gray-400)", fontSize: 13, fontWeight: 400 }}>(optional)</span></h2>
          <div className={styles.grid3}>
            <div className="form-group">
              <label className="form-label">Vehicle type</label>
              <select className="form-input" value={form.vehicleType} onChange={set("vehicleType")}>
                <option value="">Select type</option>
                <option>Bike</option>
                <option>Car</option>
                <option>Auto</option>
                <option>Scooty</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Model</label>
              <input className="form-input" placeholder="e.g. Honda Activa" value={form.vehicleModel} onChange={set("vehicleModel")} />
            </div>
            <div className="form-group">
              <label className="form-label">Number plate</label>
              <input className="form-input" placeholder="e.g. GJ01AB1234" value={form.vehicleNumber} onChange={set("vehicleNumber")} />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <h2 className={styles.sectionLabel}>Additional notes <span style={{ color: "var(--gray-400)", fontSize: 13, fontWeight: 400 }}>(optional)</span></h2>
          <textarea
            className="form-input"
            rows={3}
            placeholder="Pickup exact spot, luggage space, route stops..."
            value={form.description}
            onChange={set("description")}
            style={{ resize: "vertical" }}
          />
        </div>

        <div className={styles.actions}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? <span className="spinner" /> : "Post ride →"}
          </button>
        </div>
      </form>
    </div>
  );
}