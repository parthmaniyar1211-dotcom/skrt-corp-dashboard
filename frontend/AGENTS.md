<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:session-summary -->
# Session Summary — Delivery Statement Page

## What was done
- **Delivery Statement page** (`enterprise/frontend/src/app/delivery-statement/page.tsx`) fully implemented with tabular data entry, date search, save/update, print, and Download PDF (html2pdf.js).
- **Backend module**: model (`DeliveryStatement` with pageNo, dateSearch, entries array), controller (CRUD + getByDate), routes registered in `app.js`.
- **Sidebar**: Delivery Statement link added between Invoices and Analytics.
- **Inventory page**: Delivery Statement and Summary buttons added to action bar.
- **Default values**: Receipt Ch. and Demurage now default to `"5"` in `emptyRow()` — new rows are pre-filled with 5. Cells remain editable directly in the table.

## Key decisions
- Columns are single fields (no Rs/P split): S., D.R. No., Receipt No., Freight, Labour, Receipt Ch., D. Com, Demurage, Total.
- Total is calculated client-side as sum of Freight + Labour + Receipt Ch. + D. Com + Demurage.
- Print opens a new window with a clean A4 landscape template; Download PDF uses html2pdf.js CDN.
- Default 5 for Receipt Ch. and Demurage is hardcoded in `emptyRow()` — no separate settings UI per user's request.

## Relevant files
- `enterprise/frontend/src/app/delivery-statement/page.tsx` — full page component
- `enterprise/backend/src/modules/delivery-statement/model.js` — Mongoose model
- `enterprise/backend/src/modules/delivery-statement/controller.js` — CRUD + date lookup
- `enterprise/backend/src/modules/delivery-statement/routes.js` — route definitions
- `enterprise/backend/src/app.js` — route registration
- `enterprise/frontend/src/components/layout/Sidebar.tsx` — navigation links
- `enterprise/frontend/src/app/inventory/page.tsx` — action buttons for DS & Summary

## Next possible tasks
- Changes to Summary page columns/print template
- Changes to Delivery Statement columns/print template
- Any other feature adjustments across Entry, Challan, Cash Memo, Summary, Delivery Statement, or Inventory
<!-- END:session-summary -->
