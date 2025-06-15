import fs from "fs"

const summary = JSON.parse(
  fs.readFileSync("./coverage/coverage-summary.json", "utf8")
)
const pct = summary.total.lines.pct

let color = "red"
if (pct >= 90) color = "limegreen"
else if (pct >= 75) color = "yellow"
else if (pct >= 60) color = "orange"

const badge = `
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="20">
  <rect width="60" height="20" fill="#555"/>
  <rect x="60" width="60" height="20" fill="${color}"/>
  <text x="30" y="14" fill="#fff" font-size="11" font-family="Verdana" text-anchor="middle">coverage</text>
  <text x="90" y="14" fill="#000" font-size="11" font-family="Verdana" text-anchor="middle">${pct}%</text>
</svg>
`

fs.writeFileSync("./badges/coverage.svg", badge.trim())
