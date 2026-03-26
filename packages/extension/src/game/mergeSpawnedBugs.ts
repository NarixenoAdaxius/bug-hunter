/**
 * Concurrency model (Bug Hunter extension host):
 *
 * The VS Code extension runs on Node’s single-threaded event loop; `EventBus` listeners run
 * synchronously, so handlers do not interleave mid-call. We still avoid **destructive wholesale
 * replace** of state that combat depends on: re-running analysis (`spawnBugs`) must not reset
 * in-flight encounters. That is a **pessimistic** merge—preserve combat progress when the same
 * bug id is still present.
 *
 * **Optimistic** throughput elsewhere: debounced file hooks coalesce rapid edits; the webview
 * merges incoming host messages. Those patterns favor latency over strict ordering of every event.
 */

import type { Bug } from '@bughunter/shared';

/**
 * Merges freshly spawned bugs with previously displayed bugs by stable `bug.id`
 * (`bug-${issue.id}` from {@link spawnBugs}).
 *
 * When a bug was partially damaged (`0 < hp < maxHp`), carries over `hp` clamped to the new
 * `maxHp`. Defeated bugs (`hp <= 0`) and untouched bugs (`hp === maxHp`) take the new spawn
 * snapshot so metadata and stats stay in sync with the latest analysis.
 */
export function mergeSpawnedBugs(previous: Bug[], spawned: Bug[]): Bug[] {
  const prevById = new Map(previous.map((b) => [b.id, b]));
  return spawned.map((s) => {
    const p = prevById.get(s.id);
    if (!p) return s;
    if (p.hp > 0 && p.hp < p.maxHp) {
      return { ...s, hp: Math.min(p.hp, s.maxHp) };
    }
    return s;
  });
}
