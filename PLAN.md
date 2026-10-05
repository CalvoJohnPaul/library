# Plan: Borrow Book Copy Feature (+ Optional Course/Year & Section)

This is a living implementation plan. Check off items as they are completed so any
session can pick up where we left off.

**STATUS: Implementation complete & verified (2026-10-05). Remaining items are in
section 2.4b (deferred) and section 4 (optional polish).**

---

## 1. Overview

Implement the **borrow book copy** flow from the book copies table
(`web/src/features/Book/Copies.tsx` row menu → `BorrowCopy.tsx`, currently a WIP skeleton).

### Borrow flow (as specified)

1. Dialog asks for **Member ID** (this is `Member.externalId`, the human-facing ID).
2. User clicks the **arrow button** → we search for an exact match of that ID
   (`GET /members?externalId__eq=<id>` via `useMembersQuery`).
3. **Match found** → show the member for confirmation (IDs are unique, so a match
   is the correct account — no "is this correct?" question). Caption:
   "This copy will be borrowed by:" with the member card.
   - Confirmed → borrow the copy.
4. **No match** → ask for the other fields (name / course / yearAndSection) to create a
   new member, then borrow the copy with the new member.

### New requirement (added later)

- After a successful borrow, the UI should show the **transaction information**
  (e.g. the ticket as the reference number).
- To support this, `POST /book-copies/:id/borrow` and `POST /book-copies/:id/return`
  must return `{ ok: true, data: { bookCopy: {...}, transaction: {...} } }`
  instead of the current `{ ok: true, data: BookCopy }`.

### Related schema change (prerequisite)

- `Member.course` and `Member.yearAndSection` become **optional** (nullable) in
  Prisma and in the shared zod schemas.
- In the create/update member forms, when **course is blank**, the
  **year and section** select must be **disabled and blank** too.

---

## 2. Database / API

### 2.1 Prisma schema — `api/prisma/schema.prisma`

- [x] `Member.course` → `String?`
- [x] `Member.yearAndSection` → `String?`
- [x] Migration `api/prisma/migrations/20261005130000_make_member_course_and_year_and_section_optional/`
      (applied via `prisma migrate deploy`)
- [x] `prisma generate` run (client output is `api/prisma/.generated`)

### 2.2 Shared types — `types/src/Member.ts`

- [x] `MemberDefinition`: `course: z.string().nullable()`, `yearAndSection: z.string().nullable()`
- [x] `CreateMemberInputDefinition`: `course` / `yearAndSection` → `z.string({...}).optional().nullable()`
      (keep `externalId` / `name` required; `UpdateMemberDataInputDefinition` already optional+nullable)
- [x] Rebuilt: `pnpm --filter @library/types build`

### 2.3 Shared types — borrow/return response (inlined, no separate `*Result` definitions)

- [x] No new shared definitions — the result shape is inlined where needed:

```ts
z.object({bookCopy: BookCopyDefinition, transaction: TransactionDefinition})
```

- [x] Used in `api/src/routes/bookCopies.ts` (borrow/return response schemas) and in
      `web/src/hooks/useBorrowBookCopyMutation.ts` / `useReturnBookCopyMutation.ts`
      (response parsing). Hooks' `UseMutationOptions` generic becomes
      `{bookCopy: BookCopy; transaction: Transaction}`.
- Note: kept in `Transaction.ts`'s dependency direction (BookCopy.ts must not import
      Transaction.ts — circular ESM import would crash at module evaluation).

### 2.4 API routes — `api/src/routes/members.ts`

- [x] `POST /members` (create): pass `course` / `yearAndSection` through as-is
      (`req.body.course` may be `null`/`undefined` → Prisma stores `null` for a
      nullable column with no default). No other change needed.
- [x] `PATCH /members/:id` (update): unchanged — `clean()` strips nulls, so
      blank course/yearAndSection means "no change" (same semantics as before).
- [x] `DELETE /members/:id` (update, follow-up fix): now runs in a `$transaction` that
      first releases (sets AVAILABLE) any copies the member still had borrowed —
      previously their borrow transactions were cascade-deleted with the member, leaving
      those copies stuck as `BORROWED` with no way to return them. Decision: auto-release
      copies (chosen over blocking the deletion).
- [x] Follow-up fix (blank validation): `CreateMemberInputDefinition`'s required fields
      (`externalId`, `name`) are now `.trim().min(1)` — previously `z.string()` accepted
      `''`, so a member could be created with no name (e.g. via the borrow dialog's
      create step). Applies everywhere the schema is used (borrow create step, AddMember,
      API body validation). Zod also trims the stored values.

### 2.4b Deferred: course/yearAndSection cross-field validation (do later)

- [ ] Add `superRefine` to `CreateMemberInputDefinition` only (NOT the update schema):
      if `course` is non-null/non-blank then `yearAndSection` must be too, and vice versa
      (issue on the missing field, e.g. "Course is required" / "Year and section is required").
      Zod version is 4.6.5 (`ctx.addIssue({code: 'custom', path: [...], message})`).
      The borrow flow's create step gets this for free since it uses
      `CreateMemberInputDefinition`.

### 2.5 API routes — `api/src/routes/bookCopies.ts`

- [x] `POST /book-copies/:id/borrow`:
      - captures the created transaction via `tx.transaction.create({..., select: {...}})`
        (select includes the nested `member` + `bookCopy` relations required by
        `TransactionDefinition`)
      - `$transaction` returns `[bookCopy, transaction]` as a const tuple
      - response `200` schema → `SuccessfulHttpResponseDefinition(z.object({bookCopy, transaction}))`
      - reply body → `{ ok: true, data: { bookCopy, transaction } }`
- [x] `POST /book-copies/:id/return`: same treatment (RETURN transaction, same ticket)

---

## 3. Web

### 3.1 `web/src/hooks/useBorrowBookCopyMutation.ts`

- [x] Parse response with the inlined `z.object({bookCopy, transaction})`
- [x] Return type becomes `{bookCopy: BookCopy; transaction: Transaction}`

### 3.2 `web/src/hooks/useReturnBookCopyMutation.ts`

- [x] Same change as 3.1
- [x] Audited other consumers (`web/src/features/Member/ReturnBookCopy.tsx`,
      `web/src/features/Transactions/ReturnBookCopy.tsx`, `web/src/features/Book/ReturnCopy.tsx`) —
      they only use the result for cache invalidation/side effects, nothing reads it as a
      `BookCopy`

### 3.3 `web/src/features/Members/AddMember.tsx` (create member)

- [x] Course select: blank → `null` (`field.onChange(value || null)`)
- [x] Course select `onChange`: when blank, also clear year & section
      (`form.setValue('yearAndSection', null, {shouldValidate: true})`)
- [x] Year & section select: `disabled={!course}` where `const course = form.watch('course')`
- [x] Submit: normalizes blanks → `course: data.course || null`, `yearAndSection: data.yearAndSection || null`

### 3.4 `web/src/features/Members/EditMember.tsx` (update member)

- [x] Same course/yearAndSection disable + blank-cascade logic as AddMember
- [x] Kept the existing `omitBy` diff as-is (blank course/yearAndSection means
      "no change" on update — matches the API's `clean()` semantics)

### 3.5 `web/src/features/Member/Settings.tsx` (update member, detail page)

- [x] Same changes as EditMember (form logic only; kept the existing `omitBy` as-is)

### 3.6 `web/src/features/Book/BorrowCopy.tsx` — the main feature (full rewrite)

- [x] Four steps: `SEARCH` → `CONFIRM` → `CREATE` → `SUCCESS`
- [x] **SEARCH**: Member ID input + arrow IconButton (spinner while searching) +
      Enter key triggers search. Lookup via inline `useMutation` +
      `client.fetchQuery(useMembersQuery.getQueryKey/getQueryFn({externalId: {eq: id}}))`
      - Found → **CONFIRM** · Not found → **CREATE** (prefills the typed ID) ·
        Empty input → inline "Member ID is required." error text
- [x] **CONFIRM**: member card (ID / name / course `—` / year & section `—`) with the
      caption "This copy will be borrowed by:" (no "is this the correct account?" question —
      IDs are unique so a match is correct). Footer: "Cancel" + "Confirm" (borrows).
      Confirm is the only path forward besides Cancel.
- [x] **CREATE**: react-hook-form + `CreateMemberInputDefinition` (ID / name / course /
      yearAndSection with the blank-course → disabled+blank rule) → `createMemberMutation.mutateAsync`-style
      chain then borrow. If the member was already created in a failed attempt
      (same externalId), skips create and borrows directly. "Back" returns to SEARCH.
- [x] **SUCCESS**: transaction summary (Reference/ticket, borrower, book, ISBN,
      date borrowed) + "Done" (replaces the form; header icon switches to a check)
- [x] Invalidation on success: bookCopies / book / books / member (by id) / members /
      transactions + success toast
- [x] Reset on close (`onExitComplete`): step → SEARCH, member → null, transaction → null,
      search value/error cleared, form reset
- [x] Borrow sends `remarks: null` (no remarks field in the specified flow)

### 3.7 Success UI — show transaction info after borrowing

- [x] Implemented as the SUCCESS step inside the same dialog (see 3.6)

---

## 4. Verification

- [x] `pnpm --filter @library/types build`
- [x] `pnpm --filter @library/api build` + `tsc --noEmit` (clean)
- [x] `pnpm --filter @library/web build` (`tsc -b` + vite, clean — nullable
      course/yearAndSection caused no type fallout in the members table cells)
- [x] `pnpm lint` (Biome, clean)
- [x] End-to-end smoke test against the running API (temporary script, since removed):
      - login + CSRF flow works
      - borrow → `{data: {bookCopy (BORROWED), transaction (BORROW/PENDING, ticket, member, bookCopy)}}` ✓
      - return → `{data: {bookCopy (AVAILABLE), transaction (RETURN/COMPLETED, same ticket)}}` ✓
      - create member with `course: null` / `yearAndSection: null` → stored as null ✓
      - `GET /members?externalId__eq=...` exact lookup ✓
      - partial `PATCH /members/:id` still works ✓
      - test data cleaned up afterwards
- [x] Follow-up smoke test (delete-member fix): borrow a copy → delete the borrowing
      member → the copy is released back to `AVAILABLE` (test data cleaned up)
- [x] Follow-up smoke test (blank validation): `POST /members` with `name: ''`,
      `name: '   '`, or `externalId: ''` → all rejected with 400 ("Name is required" /
      "External ID is required"); valid input accepted with values trimmed
- [ ] Manual UI test in the browser (borrow with existing member ID; borrow with unknown
      ID → creates member; optional course left blank → year & section disabled + blank;
      success step shows the ticket reference)

---

## 5. Notes / decisions already made

- `Member.externalId` is the "Member ID" users type (unique string). `Member.id` is the DB int.
- The borrow endpoint, `BorrowBookCopyDataInputDefinition` (`{ memberId, remarks? }`),
  and `useBorrowBookCopyMutation` already existed — only the response shape changed.
- `clean()` (api/src/helpers/clean.ts) strips `''`/null/undefined; it stays as-is.
  Blank course/yearAndSection on PATCH therefore means "no change".
- Borrow dialog does **not** include a remarks field (not part of the specified flow);
  it sends `remarks: null`. The API already supports optional remarks if we add it later.
- Kept dialog conventions: ark `Dialog` wrapper + `useDisclosure` + `Dialog.Context` menu
  trigger + `SpinnerIcon` on pending buttons + `toaster` feedback.
- In `BorrowCopy.tsx`, the dialog's `<form>` only submits in the CREATE step
  (`onSubmit` guards by step); SEARCH uses Enter/arrow instead.
