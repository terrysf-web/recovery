v112 All Card Move

Upload:
1. admin.html -> recovery/admin.html
2. index.html -> recovery/index.html

Changes:
- Existing standard patient app cards can be moved:
  Today's Reminder
  What's Normal Today
  Foods Allowed
  Avoid Today
  Call Clinic If
- Extra App Cards keep their existing Add Card / Move / Delete functions.
- Card order is saved in appCardOrder after Save to Cloudflare.
- Patient app reorders existing cards without hiding/recreating them.
- No Worker change required.

Test:
- admin.html?v=112
- Move one standard card, Save to Cloudflare, Open Live Preview.
