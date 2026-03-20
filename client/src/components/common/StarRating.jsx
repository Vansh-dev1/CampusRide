import { useState } from "react";
import styles from "./StarRating.module.css";

export default function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = "md",
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className={`${styles.stars} ${styles[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${styles.star} ${
            star <= active ? styles.filled : styles.empty
          }`}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          disabled={readOnly}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}