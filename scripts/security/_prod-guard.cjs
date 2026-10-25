const REFS = ["hypbttzeqeupwdzbgwbd", "bvdsfwmlylnmahridalj"];
const hits = Object.entries(process.env)
  .filter(([k, v]) => typeof v === "string" && REFS.some((r) => v.includes(r)))
  .map(([k]) => k);
if (hits.length) {
  console.error("REFUSING: production Supabase project referenced in env: " + hits.join(", "));
  process.exit(1);
}