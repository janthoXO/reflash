---
applyTo: "browser-extension/src/**/*.ts,browser-extension/src/**/*.tsx"
---
use plasmos message api to communicate between ui, background and content scripts. DO NOT use chromes api directly.
use tailwind and radix ui components for styling. use theme colors (primary, secondary, ...) instead of hardcoding colors
always work in the relative path of browser-extension/...