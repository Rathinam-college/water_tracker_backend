# LocalStorage Namespacing (Token Details)

## The Problem: Cross-App Logout Bug

Previously, the users experienced a bug where logging into one app (e.g., Power Tracker) would unexpectedly log them out of another app (e.g., Water Tracker, Food Tracker, or CCTV). 

This happened because all of our applications are hosted under the exact same top-level domain:
* `https://insight.rathinamtechzone.com/water_tracker/`
* `https://insight.rathinamtechzone.com/power_tracker/`
* `https://insight.rathinamtechzone.com/food_tracker/`

Web browsers enforce a security policy called the **Same-Origin Policy**. Under this policy, `localStorage` is shared across an entire domain. Because all trackers share `insight.rathinamtechzone.com`, they all share the **exact same `localStorage` database**. 

Originally, all our frontend React apps were saving their authentication tokens using generic keys like:
* `localStorage.setItem('token', userToken);`
* `localStorage.setItem('user', userData);`
* `localStorage.setItem('theme', themeName);`

When a user opened Water Tracker, it saved `token=123`. Then, when they opened Power Tracker in a new tab, Power Tracker saved `token=456`. This instantly overwrote Water Tracker's token. When the user went back to the Water Tracker tab and clicked anything, the app read `token=456` (which belongs to Power Tracker), the Water Tracker backend rejected it, and forced the user to log out.

---

## The Solution: Unique Token Namespacing

To fix this, we implemented **Key Namespacing**. Instead of using generic names, every single item saved in `localStorage` must be prefixed with a unique identifier specific to that tracker.

For example, the keys are now separated like this:

### 1. Water Tracker (`wt_`)
* `wt_token`
* `wt_user`
* `wt_theme`
* `wt_editEntry`

### 2. Power Tracker (`pt_`)
* `pt_token`
* `pt_user`
* `pt_theme`
* `pt_editProcurementEntry`

### 3. Food Tracker (`ft_`)
* `ft_token`
* `ft_user`

By ensuring each app uses its own designated prefix, the browser's `localStorage` looks like this behind the scenes:
```json
{
  "wt_token": "water_token_123",
  "wt_user": "{...}",
  "pt_token": "power_token_456",
  "pt_user": "{...}"
}
```

Now, the apps completely ignore each other's data. Power Tracker only ever looks for keys starting with `pt_`, and Water Tracker only looks for `wt_`. This allows users to stay logged into every single tracker simultaneously without them interfering with one another.