App-Matched Section Editor v103

Current v103 files:
- index.html: Patient Recovery Guide
- code.html: Staff Code Management
- admin.html: Admin App Management
- worker-api.js: Cloudflare Worker API source

Rollback note:
- v65 is the stable emergency rollback baseline.
- v103 is the current development target in this folder.

Upload:
1. admin_app_sections_v103.html -> admin.html
2. index_app_sections_v103.html -> index.html

Changes:
- Admin section titles now match the patient app:
  Today’s Reminder
  What’s Normal Today
  Foods Allowed
  Avoid Today
  Call Clinic If
- Each standard section title is editable.
- Added Extra App Sections:
  + Add Section
  Move Up / Move Down
  Delete Section
  Each extra section has Title, Icon, and Card Text.
- Extra sections appear in the patient app below the standard cards.
- Existing item-level Add/Move/Delete still works.

Cloudflare Worker API:
- Deploy worker-api.js as the Worker script.
- Required KV binding: RECOVERY_KV
- Required secret: ADMIN_PASSWORD
- Optional secrets: STAFF_PASSWORD, GEMINI_API_KEY
- If STAFF_PASSWORD is not set, staff code.html accepts ADMIN_PASSWORD.
