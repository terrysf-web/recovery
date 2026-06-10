v111 Live Preview Fix

Upload:
1. admin.html -> recovery/admin.html
2. index.html -> recovery/index.html

Fix:
- Open Live Preview uses local ./index.html instead of old hardcoded/cached link.
- Adds v=111 and cache busting.
- Reload Preview and Live Preview should use the same current files.
- No Worker change required.

Test:
Open admin.html?v=111 and click Open Live Preview.
