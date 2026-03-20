import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import RideCard from "../components/common/RideCard";
import styles from "./FindRide.module.css";

export default function FindRide() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: "", to: "", date: "", minSeats: "" });

  const fetchRides = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.from) params.append("from", f.from);
      if (f.to) params.append("to", f.to);
      if (f.date) params.append("date", f.date);
      if (f.minSeats) params.append("minSeats", f.minSeats);
      const res = await api.get(`/rides?${params}`);

      // Filter out corrupt/test rides with missing required fields
      const valid = res.data.rides.filter(
        (r) => r.from?.trim() && r.to?.trim() && r.fare != null && r.departureTime
      );
      setRides(valid);
    } catch {
      setRides([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRides(filters); }, []); // eslint-disable-line

  const set = (field) => (e) =>
    setFilters((p) => ({ ...p, [field]: e.target.value }));

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRides(filters);
  };

  const handleClear = () => {
    const empty = { from: "", to: "", date: "", minSeats: "" };
    setFilters(empty);
    fetchRides(empty);
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Find a ride</h1>
        <p className={styles.subtitle}>Search rides posted by your fellow students</p>
      </div>

      {/* Filters */}
      <form className={styles.filterCard} onSubmit={handleSearch}>
        <div className={styles.filterGrid}>
          <div className="form-group">
            <label className="form-label">From</label>
            <input className="form-input" placeholder="e.g. GIDC Gate" value={filters.from} onChange={set("from")} />
          </div>
          <div className="form-group">
            <label className="form-label">To</label>
            <input className="form-input" placeholder="e.g. City Bus Stand" value={filters.to} onChange={set("to")} />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              className="form-input"
              type="date"
              value={filters.date}
              onChange={set("date")}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Min seats</label>
            <select className="form-input" value={filters.minSeats} onChange={set("minSeats")}>
              <option value="">Any</option>
              {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>
        </div>
        <div className={styles.filterActions}>
          {hasFilters && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleClear}>
              Clear filters
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : "Search rides"}
          </button>
        </div>
      </form>

      {/* Results */}
      <div className={styles.results}>
        <p className={styles.resultCount}>
          {loading
            ? "Searching..."
            : `${rides.length} ride${rides.length !== 1 ? "s" : ""} found`}
        </p>

        {loading ? (
          <div className="flex-center" style={{ padding: 60 }}>
            <span className="spinner spinner-dark" />
          </div>
        ) : rides.length === 0 ? (
          <div className={styles.empty}>
            <span style={{ fontSize: 36 }}>🔍</span>
            <p>No rides found.</p>
            <p className="text-muted">
              {hasFilters ? "Try removing some filters." : "No rides available yet."}
            </p>
          </div>
        ) : (
          <div className={styles.ridesList}>
            {rides.map((r) => <RideCard key={r._id} ride={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}