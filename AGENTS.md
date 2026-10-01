<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Architecture decisions

- `public.turnos` is the single queue table; the display (`/`) and staff panel
  (`/panel`) both read it via the browser Supabase client with TanStack Query
  polling (5s). Why: one source of truth shared across TV screen and staff
  device without realtime infra.
- The public display must never show full surnames: only first name + initial
  of last name (`nombrePublico()` in `src/lib/turnos.ts`). Why: patient privacy
  is a project requirement (anonymized ticket rule).
- RLS on `turnos` is permissive to `anon` for this demo prototype. Why: the
  staff panel has no auth yet; revisit before any real deployment.

