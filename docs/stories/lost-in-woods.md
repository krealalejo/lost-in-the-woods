# Lost in the Woods

## Summary

It is six o'clock on a Tuesday. Mom's flight lands at seven. You need to pick her up from the airport — don't be late.

The game starts in your living room. Car keys are on the rug. The front door is locked. Somewhere between the house and the airport lies a forest that doesn't want to let you go.

**Locations:** House → Forest → Clearing  
**Win condition:** Reach the clearing in ≤ 25 turns  
**Lose condition:** Reach the clearing in > 25 turns (vampires)  
**Stuck condition:** Stay in the forest indefinitely (wrong direction resets progress)

---

## Happy Path

Reach the clearing in 25 turns or fewer. The forest sequence must be completed in one unbroken chain — any wrong direction resets `forestStep` to 0.

| Step | Command                  | Result                               |
| ---- | ------------------------ | ------------------------------------ |
| 1    | `take keys`              | Keys added to inventory              |
| 2    | `open door`              | Front door opens                     |
| 3    | `go north` (or any move) | You drive off, enter forest          |
| 4    | `north`                  | Forest step 1/10                     |
| 5    | `north`                  | Forest step 2/10                     |
| 6    | `east`                   | Forest step 3/10                     |
| 7    | `north`                  | Forest step 4/10                     |
| 8    | `east`                   | Forest step 5/10                     |
| 9    | `south`                  | Forest step 6/10                     |
| 10   | `west`                   | Forest step 7/10                     |
| 11   | `north`                  | Forest step 8/10                     |
| 12   | `north`                  | Forest step 9/10                     |
| 13   | `east`                   | YOU ARE OUT OF THE FOREST → Clearing |

**Outcome:** Airport lights visible. You sprint. Make the 7 PM pickup with three minutes to spare. Mom asks how the drive was. You say it was fine.

> The game notes this ending is "statistically almost impossible."

---

## Terror Path

Same as the happy path but with more than 25 turns spent before completing the forest sequence. Every wrong direction, every `wait`, every `look` — each command burns a turn via `INCREMENT_TURNS`.

| Phase         | What happens                                               |
| ------------- | ---------------------------------------------------------- |
| House         | Normal — turns accumulate here too                         |
| Forest        | Wrong directions reset `forestStep` to 0, still burn turns |
| After turn 25 | Next forest completion triggers vampire ending             |
| Clearing      | `enterClearingEffects` checks `turnsAfterEntry > 25`       |

**Outcome:** You reach the clearing. The runway lights aren't blinking — they are eyes. While you were lost, the world fell. Mom was the first to go. **THE VAMPIRES WON. GAME OVER.**

> Triggered by `turnsAfterEntry > 25` in `enterClearingEffects` (`handlers.ts:331`).

---

## Lost Path

The player never escapes the forest. Wrong direction → `forestStep` resets to 0 → player is back to square one. This can loop indefinitely.

| Behavior                     | Detail                                                       |
| ---------------------------- | ------------------------------------------------------------ |
| Wrong direction in forest    | `forestStep` resets to 0, generic forest description printed |
| Correct sequence interrupted | Any single wrong step resets the whole chain                 |
| Turn counter                 | Keeps incrementing — every command burns a turn              |
| No exit                      | Forest has no fallback exit; only the exact sequence works   |
| Forest descriptions rotate   | 5 descriptions cycle based on `(turns + forestStep) % 5`     |

**Outcome:** The player wanders forever. The trees are tall and look exactly the same. A branch creaks somewhere behind you. You feel like you've been here before.

> The forest sequence: `N N E N E S W N N E` — defined as `FOREST_SEQUENCE` in `handlers.ts:5`.
