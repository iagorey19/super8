---
version: alpha
name: Supabase-Inspired-design-analysis
description: Design system inspired by Supabase — clean white-and-near-black system with emerald-green CTA, humanist sans display, and dense product UI. Minimal chrome, near-monochrome palette, green primary as the only chromatic event.
---

colors:
  primary: "#3ecf8e"
  primary-deep: "#24b47e"
  primary-soft: "#4ade80"
  ink: "#171717"
  ink-secondary: "#212121"
  ink-mute: "#707070"
  ink-mute-2: "#9a9a9a"
  ink-faint: "#b2b2b2"
  on-primary: "#171717"
  on-dark: "#ffffff"
  canvas: "#ffffff"
  canvas-soft: "#fafafa"
  canvas-night: "#1c1c1c"
  canvas-night-soft: "#202020"
  hairline: "#dfdfdf"
  hairline-strong: "#c7c7c7"
  hairline-cool: "#ededed"

typography:
  display-xxl:
    fontFamily: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 64px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -1.92px
  display-xl:
    fontFamily: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 48px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -1.44px
  display-lg:
    fontFamily: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 36px
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: -0.72px
  display-md:
    fontFamily: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 28px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: -0.42px
  heading-lg:
    fontFamily: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 22px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0
  heading-md:
    fontFamily: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  body-lg:
    fontFamily: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  body-md:
    fontFamily: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  button-md:
    fontFamily: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: 0
  caption:
    fontFamily: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  micro:
    fontFamily: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  code:
    fontFamily: "ui-monospace, Menlo, Monaco, Consolas, 'Liberation Mono', monospace"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  huge: 64px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: 8px 16px
  button-primary-pressed:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: 8px 16px
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: 8px 16px
  button-on-dark:
    backgroundColor: "{colors.canvas-night}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: 8px 16px
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
  card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  card-dark:
    backgroundColor: "{colors.canvas-night}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  code-block:
    backgroundColor: "{colors.canvas-night}"
    textColor: "{colors.on-dark}"
    typography: "{typography.code}"
    rounded: "{rounded.sm}"
    padding: 16px
  pill-green:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.micro}"
    rounded: "{rounded.full}"
    padding: 2px 8px
---

## Overview

Design system inspired by Supabase. Clean white canvas with near-monochrome palette. Single emerald green primary as the only chromatic event. Inter (or Circular) at weight 500 for display, weight 400 for body. Tight negative letter-spacing on display tiers. Product UI mockups as dominant decorative element.

**Key Characteristics:**
- Single emerald primary (`#3ecf8e`) for CTAs only
- White canvas marketing track with greyscale hierarchy
- Display tier: weight 500, negative letter-spacing (-1.92px to -0.42px)
- Buttons: 6px radius (square-ish, never pill-shaped)
- Code blocks: deep dark (`#1c1c1c`) with monospace
- Near-black text (`#171717`) on green buttons (not white)

## Tailwind Mapping

| Token | Tailwind Class |
|-------|---------------|
| primary | `bg-[#3ecf8e]` / `text-[#3ecf8e]` |
| primary-deep | `bg-[#24b47e]` |
| ink | `text-[#171717]` |
| ink-mute | `text-[#707070]` |
| canvas | `bg-white` |
| canvas-soft | `bg-[#fafafa]` |
| canvas-night | `bg-[#1c1c1c]` |
| hairline | `border-[#dfdfdf]` |
| rounded-sm | `rounded-sm` (6px) |
| rounded-lg | `rounded-xl` (12px) |

## Do's and Don'ts

### Do
- Reserve emerald for filled CTAs — appear sparingly
- Display tiers at weight 500 with negative letter-spacing
- Use 6px radius for buttons (square-ish)
- Use near-black on green buttons (not white)
- System mono for code blocks

### Don't
- Don't introduce additional accent colors as system colors
- Don't bump display weight above 500
- Don't use pill-shaped buttons
- Don't use white text on emerald buttons
- Don't add atmospheric gradients to hero sections

## Responsive

| Breakpoint | Width | Changes |
|-----------|-------|---------|
| Wide | >= 1440px | Full width |
| Desktop | 1024-1440px | Default max-width |
| Tablet | 768-1023px | Simplify layouts |
| Mobile | < 768px | Stack columns, hamburger nav |

Touch targets >= 36x36px on mobile.
