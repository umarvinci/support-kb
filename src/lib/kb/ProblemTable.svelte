<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { problemsIn, type Problem } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';
  import type { Report } from '#lib/kb/causes';

  // tickets: where each problem is tracked, and where that ticket stands.
  type Tracked = { url: string; state: string };
  let { ticket, tickets = {} }: { ticket: number; tickets?: Partial<Record<Problem, Tracked>> } = $props();

  const found = $derived(problemsIn(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const ref = (url: string) => url.replace(/^https:\/\/github\.com\//, '').replace('/issues/', '#');
</script>

<p class="sum">
  <strong>{found.total}</strong> reports merged into #{ticket} ·
  <strong>{found.rows.length}</strong>
  {found.rows.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>tracked in</th></tr>
  </thead>
  <tbody>
    {#each found.rows as p (p.problem)}
      {@const t = tickets[p.problem]}
      <tr class:untracked={!t}>
        <td><code>{p.problem}</code></td>
        <td>
          {p.reports}
          {#if p.alsoIn.length}<span class="also">also counted under {p.alsoIn.join(', ')}</span>{/if}
        </td>
        <td>{p.tenants}</td>
        <td>{p.firstSeen} → {p.lastSeen}</td>
        <td>
          {#if t}<a href={t.url}>{ref(t.url)}</a> · {t.state}{:else}no ticket{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .also { display: block; color: var(--muted); font-size: 0.85em; }
  .untracked td { background: var(--warn-bg); }
  .untracked td:last-child { color: var(--warn); font-weight: 600; }
</style>
