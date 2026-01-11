---
applyTo: "browser-extension/**/*"
---
use plasmos message api to communicate between ui, background and content scripts. DO NOT use chromes api directly.
use tailwind and shadcn components for styling. use theme colors (primary, secondary, ...) instead of hardcoding colors
always use commands in the relative path ./browser-extension/