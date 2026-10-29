// The problems inside one merged ticket, as the reports show them. Pages explain it; this file is what runs.

// causes.ts places a report by its tenant and channel. That holds for month/day swaps, but a report
// the desk read as a one-day move (desk-notes.json) describes something a swap can't produce: the
// date moved by one day. It is its own problem, `shift`, whatever tenant it came from.
import { causeOf, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'shift';

export function problemOf(r: Pick<Report, 'id' | 'channel'>, t: Tenant | undefined, shifted: readonly string[]): Problem | null {
  return shifted.includes(r.id) ? 'shift' : causeOf(r, t);
}

export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: Report[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
};

// Reports merged into `ticket`, one per id, grouped by problem, biggest first.
export function problemsIn(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  shifted: readonly string[],
): ProblemGroup[] {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const byProblem = new Map<ProblemGroup['problem'], Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r), shifted) ?? 'unplaced';
    byProblem.set(p, [...(byProblem.get(p) ?? []), r]);
  }
  return [...byProblem.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: new Set(rs.map((r) => r.tenant)).size,
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
