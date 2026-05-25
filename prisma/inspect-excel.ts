import * as XLSX from "xlsx"
const wb = XLSX.readFile("C:/Users/inspira/Downloads/APLIKACIJA imenice.xlsx")
const ws = wb.Sheets["imenice"]
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as string[][]

// Find rows where col 0 is a number (section markers)
console.log("=== Section markers ===")
for (let i = 0; i < rows.length; i++) {
  const cell = String(rows[i][0]).trim()
  if (cell.match(/^\d+$/)) {
    const next = rows[i+1] ? JSON.stringify(rows[i+1].slice(0,4)) : ""
    console.log("  Row " + i + ": SEKCIJA " + cell + " → next: " + next)
  }
}
