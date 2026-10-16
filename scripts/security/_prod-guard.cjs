const REF = "hypbttzeqeupwdzbgwbd";
const hits = Object.entries(process.env)
  .filter(([k, v]) => typeof v === "string" && v.includes(REF))
  .map(([k]) => k);
if (hits.length) {
  console.error("REFUSING: production Supabase project referenced in env: " + hits.join(", "));
  process.exit(1);
}