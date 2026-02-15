# KodNest Premium Build System

Design system for a calm, intentional B2C product. One mind, no visual drift.

## Philosophy

- **Calm, intentional, coherent, confident**
- No gradients, glassmorphism, neon, or animation noise
- Maximum 4 colors; spacing from a single scale; consistent transitions

## Structure

| File | Purpose |
|------|--------|
| `tokens.css` | Colors, typography, spacing, radius, transition |
| `base.css` | Reset, font loading, heading/body styles |
| `layout.css` | Top Bar, Context Header, Workspace, Panel, Proof Footer |
| `components.css` | Buttons, inputs, cards, badges, prompt box, proof checklist, error/empty states |
| `index.css` | Single entry — import this |

## Global layout (every page)

1. **Top Bar** — Project name (left), Step X / Y (center), Status badge (right)
2. **Context Header** — Large serif headline + one-line subtext
3. **Main** — Primary Workspace (70%) + Secondary Panel (30%)
4. **Proof Footer** — Checklist: UI Built, Logic Working, Test Passed, Deployed

## Usage

Link `index.css` in your app, then use the class names documented in each file. Do not introduce new spacing values (use 8, 16, 24, 40, 64 only) or new colors.
