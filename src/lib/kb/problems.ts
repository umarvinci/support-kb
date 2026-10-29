// The problems inside one merged ticket, counted the desk's way. Pages explain it; this file is what runs.

// Counts follow causes.ts as exported: every report sits under the cause it is filed by. A report
// the desk read as a one-day move (desk-notes.json) stays counted where it is filed, and is also its
// own problem, `shift`: a month/day swap can't move a date by one day.
import { groupByCause, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'unplaced' | 'shift';

export type ProblemRow = {
  problem: Problem;
  reports: number;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  // For `shift`: the causes its reports are counted under.
  alsoIn: Problem[];
};

function row(problem: Problem, rs: Report[], alsoIn: Problem[] = []): ProblemRow {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs.length,
    tenants: new Set(rs.map((r) => r.tenant)).size,
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
    alsoIn,
  };
}

// Reports merged into `ticket`, one per id: one row per cause, biggest first, then `shift`.
export function problemsIn(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  shifted: readonly string[],
): { total: number; rows: ProblemRow[] } {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const rows = groupByCause(merged, tenantOf).map((g) => row(g.cause, g.reports));
  const moved = merged.filter((r) => shifted.includes(r.id));
  if (moved.length) rows.push(row('shift', moved, groupByCause(moved, tenantOf).map((g) => g.cause)));
  return { total: merged.length, rows };
}
