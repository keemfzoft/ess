# ⚡ ESS – Ephemeral Storage Solution

**ESS** is a lightweight wrapper around *sessionStorage*, designed for temporary data persistence within a browser session. Ideal for transient states, drafts, and short-lived flows that vanish when the tab closes.

## ✨ Features

* Temporary data storage that is scoped per browser tab or window.
* Data is cleared when the browser tab or window is closed.
* Can handle a maximum ~5MB data limit across modern browsers like Chrome, Firefox and Edge while ~2.5MB on Safari.
* May not function in incognito mode.

**Note:** This is currently an ***experimental*** component.