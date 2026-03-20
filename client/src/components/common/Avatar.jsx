export default function Avatar({ user, size = "md", className = "" }) {
  const sizeClass = `avatar avatar-${size} ${className}`;
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={sizeClass}
        style={{ objectFit: "cover" }}
      />
    );
  }

  return (
    <div className={sizeClass}>
      {initials}
    </div>
  );
}