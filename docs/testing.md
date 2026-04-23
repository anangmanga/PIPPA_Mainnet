# Testing Checklist

1. **Admin Authentication**
   - Visit `/admin/login`, enter the `ADMIN_SECRET`, and confirm redirect to `/admin`.
   - Click **Sign Out** and verify direct navigation to `/admin` forces a new login.

2. **Collections & Promos**
   - Update a collection name, save, then refresh `/explore` to see the change.
   - Modify the Welcome or Merchandise promo copy/media and confirm the homepage reflects it.

3. **Merchandise Updates**
   - Edit a product’s USD price and upload a new image; ensure `/merchandise` shows the update and Pi price recalculates.
   - Confirm the delivery disclaimer banner still appears beneath the grid.

4. **Pi Pricing Monitor**
   - In `/admin`, click **Sync latest price** and ensure the timestamp and conversion rate update.
   - Refresh `/merchandise` to check the new conversion value is rendered.

5. **Checkout Flow (Pi Browser)**
   - Authenticate via the Pi Browser using the **Checkout with Pi** button.
   - Complete (or cancel) a payment and verify order status reflects CONFIRMED or CANCELLED accordingly from the admin panel / database.

6. **Error Handling**
   - Temporarily block the ZyraChain endpoint (e.g., dev tools) and confirm the fallback “Pi price unavailable” message displays.
   - Attempt checkout without authentication to ensure the user is prompted to sign in first.

> Repeat after each deployment or schema change. Extend with automated tests (Playwright/Cypress) when Pi Browser automation hooks become available.
