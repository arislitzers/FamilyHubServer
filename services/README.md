# services/

Thin data-access modules that wrap Supabase queries for a single domain
(e.g. `families.service.ts`, `planner.service.ts`). Keeping query logic
here — instead of inline in components — means:

- Components stay focused on rendering.
- Query logic is reusable between Server Components, Route Handlers,
  and client hooks.
- Future prompts can swap the implementation (e.g. add caching) without
  touching every call site.

Each future feature module should add its own `*.service.ts` file here.
This foundation intentionally ships no feature services yet — only the
pattern, illustrated below.
