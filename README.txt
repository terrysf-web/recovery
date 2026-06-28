v200 Standard Procedure Codes

Upload:
1. admin.html -> recovery/admin.html
2. index.html -> recovery/index.html
3. code.html -> recovery/code.html

Major change:
- Removed the need for individual generated patient codes.
- Patient app now accepts four standard procedure codes:
  PERIO    -> Periodontal Surgery
  IMPLANT  -> Implant
  GRAFT    -> Gum Grafting
  EXTRACT  -> Extraction
- Patient still enters surgery date.
- Staff Code Management is replaced with a simple standard-code reference/print page.
- Admin remains focused on Protocol Editor.
- Worker changes are NOT required for this version, but old access-code APIs will no longer be used by the patient app.

Test:
- Open index.html?v=200
- Enter IMPLANT and a surgery date
- The guide should open without generating any code.
