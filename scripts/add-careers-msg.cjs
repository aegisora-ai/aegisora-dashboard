const fs = require("fs");
for (const [f, label] of [["messages/en.json", "Careers"], ["messages/de.json", "Karriere"]]) {
  const j = JSON.parse(fs.readFileSync(f, "utf8").replace(/^\uFEFF/, ""));
  if (j.Footer && j.Footer.links) {
    j.Footer.links.careers = label;
    fs.writeFileSync(f, JSON.stringify(j, null, 2) + "\n");
    console.log("ok " + f);
  } else {
    console.log("UYARI: Footer.links yok: " + f);
  }
}