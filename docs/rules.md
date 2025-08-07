# Next.js App Router Architecture Rules

## 🚨 Philosophy

This guide exists to correct the lazy patterns, over-abstracted examples, and AI-generated boilerplate that poison real projects.

- Pages should not contain business logic.
- APIs must be explicit, routed endpoints — not helper functions.
- Colocate what makes clarity. Avoid shared code unless it is reusable *domain logic*, not just repeated code.
- Middleware is mandatory on API routes that accept user input.
- Decomposition should follow clarity, not line count.

---

## 🔁 Layered Responsibility

### 1. **UI (Page + Components)**
- Lives in `app/**/page.tsx` and client components
- Role: Layout, orchestration, form rendering, controlled inputs
- Avoid: Direct data fetching, business logic, DB access
- Enforce: `page.tsx` must not exceed **150 lines**. If it does, break down into clearly named colocated components.

### 2. **API Layer (Explicit Server Routes)**
- Lives in `app/api/**/route.ts`
- Role: Accept POST/PUT/DELETE, validate input, authenticate, run logic
- Must: Use `zod` (or similar) for strict parsing, throw on bad input
- Must: Be wrapped in or gated by middleware (auth, roles, etc)
- Should not: Be helpers or wrapper functions in `lib/`
- Enforce: One `route.ts` per endpoint. Named by verb/intent, not model. Max **100 lines** unless truly complex.

### 3. **Business Logic (Domain Modules)**
- Location: Either colocated in API folder or extracted to a domain module (e.g. `domain/tools/updateTool.ts`)
- Rule: Only extract if it is clearly reusable and testable in isolation
- Never: Extract just to "clean up" a route file — meaningless extraction is worse than verbosity
- Naming: `performX.ts`, `generateY.ts`, `applyZ.ts`. Not `utils`, `helpers`, or `index.ts`.

### 4. **Validation Schemas**
- Form-side validation lives with the form
- Server-side validation lives with the API handler
- Never duplicate — derive client-side schema from server schema when possible
- Naming: `validate<Thing>Input.ts`, `schema<Thing>.ts`

### 5. **Middleware**
- Use per-route-group (e.g. `app/api/(authenticated)/middleware.ts`)
- Handle: Auth, RBAC, logging, rate-limiting
- Naming: `middleware.ts` always scoped to a segment. Never global-only.

---

## 📁 File and Folder Organization

```
app/
├── tools/
│   └── [toolId]/
│       └── edit/
│           ├── page.tsx                     # Orchestrates the page
│           ├── EditToolForm/                # Colocated, scoped component
│           │   ├── index.tsx
│           │   ├── fields/
│           │   │   ├── NameField.tsx
│           │   │   └── CategoryField.tsx
│           │   └── useFormState.ts
│           └── useToolEditData.ts           # Server-side fetch for initial form
│
├── api/
│   └── tools/
│       └── update/
│           ├── route.ts                     # POST handler
│           └── validateToolUpdate.ts        # Zod schema
│           └── performUpdate.ts             # Business logic
```

---

## ❌ Anti-Patterns

| Pattern | Why It's Bad |
| --- | --- |
| `lib/api/*.ts` | Obscures intent, loses validation/middleware boundaries |
| `utils/*.ts` | Meaningless catch-all abstraction |
| Server Actions Everywhere | Blurs client/server boundary, hard to debug, hard to protect |
| Premature Shared Code | DRY is not justification without reuse + meaning |
| "Operations" as wrappers | Adds naming overhead without benefit |

---

## ✅ Rules for Scalable Code

1. **Colocate for ownership, not laziness**
2. **Extract only when logic has identity**
3. **Routes are code boundaries, not just files**
4. **Middleware isn't optional**
5. **Naming is structure. Avoid `shared/`, `utils/`, or `helpers/`**
6. **Line count is signal. If it's big, it needs a name.**

---

## 📛 Explicit Naming Rules

| File Type | Naming Convention |
| --- | --- |
| API handler | `route.ts` only, lives in descriptive folder (`create/`, `delete/`, `update/`) |
| Logic modules | `performX.ts`, `applyY.ts`, `generateZ.ts` (must reflect clear verb + noun) |
| Form hooks | `use<FormName>Form.ts` or `use<FormName>State.ts` |
| Schema | `validate<FormName>.ts` or `schema<FormName>.ts` |
| Components | Named folder w/ `index.tsx`, and subcomponents named explicitly |

---

## 🧠 AI Codegen Rules (if used)

- Don't extract helpers automatically
- Don't assume business logic goes in `page.tsx`
- Don't suggest route handlers without validation + auth
- Never create a `shared/api.ts`
- Teach the model the *structure by ownership*, not repetition
- Always respect file size rules and naming clarity

---

## 🔚 Summary

This architecture prioritizes clarity, separation of responsibility, and explicitly owned code over superficial DRYness or premature modularization. AI tools should be trained against **real-world scaled examples**, not 10-line demos that hide the actual complexity of modern apps.

Use this as the foundation for your architecture review, onboarding, and AI prompt design.