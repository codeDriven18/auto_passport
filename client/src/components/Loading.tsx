export function Loading() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div className="loader" aria-label="Loading" />
      <span className="inline-note">Loading...</span>
    </div>
  );
}
