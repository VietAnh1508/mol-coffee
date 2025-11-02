# Drink Recipes Feature

## Summary
- **Status:** New (read-only MVP)
- **Audience:** All authenticated roles (admin / supervisor / employee)
- **Goal:** Provide a dedicated “Drink Recipes” library so baristas can reference standard drink formulas during a shift.

## Architecture & Data Model
- `recipes`: catalog of drinks. Each row stores a unique `slug` for routing, the display name, and an optional description.
- `recipe_steps`: ordered list of instructions for a given recipe. Steps are 1-indexed through `step_number` to guarantee display order.
- Seed data ships with migration `20251117094500_add_recipes_feature.sql`. Add future drinks via new migrations and keep this document in sync.

### Row Level Security
- All authenticated users can `SELECT` from both tables.
- Only admins may `INSERT`, `UPDATE`, or `DELETE`. The current UI is read-only, so there are no client-side edit forms yet.

## User Experience
1. Dashboard shortcut “Công thức pha chế” links to `/recipes`.
2. The list page shows each drink’s name and optional description. Selecting a drink navigates to the detail view.
3. The detail page renders the ordered step list with a numbered badge. Steps remain readable on mobile and desktop layouts.

## Seed Data Reference
| Slug | Drink name |
| --- | --- |
| `cham-ca-phe` | Châm cà phê |
| `pha-tra-da` | Pha trà đá |
| `pha-nuoc-duong` | Pha nước đường |
| `ca-phe-da` | Cà phê đá |
| `ca-phe-sua` | Cà phê sữa |
| `bac-xiu` | Bạc xỉu |
| `ca-phe-sua-tuoi` | Cà phê sữa tươi |
| `cacao` | Cacao |
| `tra-trai-cay` | Trà trái cây |
| `matcha-latte` | Matcha latte |
| `khoai-mon-latte` | Khoai môn latte |
| `cacao-latte` | Cacao latte |

> When adding new drinks, seed the data via migration first, then adjust UI copy or interactions if needed.
