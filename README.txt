v107 Add Card Fix

Current version targets:
- v65: stable emergency rollback baseline
- v103: previous Codex-stabilized GitHub baseline
- v107: current development target in this folder

Upload:
1. admin_v107_add_card.html -> admin.html
2. index_v107_add_card.html -> index.html

Changes:
- Extra App Sections now have + Add Card.
- Each card has Card Title and Card Text.
- Each card can Move Up, Move Down, Delete.
- Extra section Move Up/Down/Delete still works.
- Patient app displays extra sections and all cards.
- Visible Admin version badge: Recovery Admin v107.
- No Worker change required.

Current files:
- index.html: Patient Recovery Guide
- code.html: Staff Code Management
- admin.html: Admin App Management
- worker-api.js: Cloudflare Worker API source

Cloudflare Worker API:
- Deploy worker-api.js as the Worker script.
- Required KV binding: RECOVERY_KV
- Required secret: ADMIN_PASSWORD
- Optional secrets: STAFF_PASSWORD, GEMINI_API_KEY
- If STAFF_PASSWORD is not set, staff code.html accepts ADMIN_PASSWORD.
