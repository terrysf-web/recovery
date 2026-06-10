v113 Reload Preview Card Order Fix

Upload:
1. admin.html -> recovery/admin.html
2. index.html -> recovery/index.html

Fix:
- Reload Preview inside Admin now follows appCardOrder.
- Moving standard cards updates Admin preview immediately.
- Live Preview behavior from v112 remains.
- No Worker change required.

Test:
1. Open admin.html?v=113
2. Move Foods Allowed up/down
3. Click Reload Preview
4. The right Admin preview should reflect the new card order
5. Save to Cloudflare
6. Open Live Preview to confirm patient app order
