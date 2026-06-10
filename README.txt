v110 Safe Preview Fix

Upload:
1. admin.html -> recovery/admin.html
2. index.html -> recovery/index.html

Purpose:
- Fix live preview / patient app where the standard cards disappeared.
- Restores standard patient app cards:
  Today's Reminder
  What's Normal Today
  Foods Allowed
  Avoid Today
  Call Clinic If
- Extra App Cards still display below the standard cards.
- Does not hide or reorder standard cards.
- No Worker change required.

After upload:
Open live preview with a cache buster:
index.html?adminPreview=1&surgeryType=periodontal&surgeryDate=2026-06-02&v=110
