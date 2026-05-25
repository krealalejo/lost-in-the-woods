# The Night Shift

## Summary

It is 3:14 AM on a Thursday. You are the last employee left on Floor 13 of a corporate office building. All you need to do is grab your coat, head down to the parking garage, and go home. But the elevator has stopped working, the silence is absolute, and the emergency stairwell seems to descend far deeper than 13 floors.

**Locations:** Cubicle → Hallway → Break Room → Infinite Stairwell → Parking Door

**Victory Condition:** Reach the parking door in ≤ 30 turns.

**Defeat Condition:** Reach the parking door in > 30 turns (The Loop).

**Lost Condition:** Get trapped in the infinite stairwell (a wrong move resets your descent).

---

## Mechanics and Routes

The main puzzle replaces cardinal navigation (N, S, E, W) with vertical and psychological movement inside the stairwell: `down`, `up`. The sequence required to break the spatial anomaly is: **Down, Down, Up, Down, Down** (`D D U D D`). Going *up* one floor when you should logically keep descending is the only thing that tricks the building’s architecture.

### The Happy Path

You escape the building in 30 turns or less. This requires finding the access card before entering the stairwell.

| Step | Command            | Result                                                    |
| ---- | ------------------ | --------------------------------------------------------- |
| 1    | `look desk`        | You see your computer still running and your **coat**.    |
| 2    | `take coat`        | Coat added to inventory.                                  |
| 3    | `go hallway`       | You leave your cubicle. The lights flicker.               |
| 4    | `go break room`    | You enter the room. It smells like stale coffee.          |
| 5    | `take keycard`     | Maintenance keycard obtained.                             |
| 6    | `go hallway`       | You return to the main hallway.                           |
| 7    | `use keycard door` | You unlock the emergency stairwell.                       |
| 8    | `down`             | Stairwell step 1/5. (Floor 12)                            |
| 9    | `down`             | Stairwell step 2/5. (Floor 11)                            |
| 10   | `up`               | Stairwell step 3/5. The air suddenly turns freezing cold. |
| 11   | `down`             | Stairwell step 4/5. (Floor 2)                             |
| 12   | `down`             | YOU BROKE THE LOOP → Parking Door.                        |

**Ending:** You shove the heavy metal door open. The cold early morning air hits your face. The security car is parked outside. You are safe. You quit your job the next morning.

---

## The Terror Path

Same as the happy path, except the player spends more than 30 turns uselessly exploring, staring at empty motivational posters, or making mistakes in the stairwell, which burns turns quickly.

| Phase         | What Happens                                                            |
| ------------- | ----------------------------------------------------------------------- |
| Floor 13      | Every useless command (`look window`, `wait`) consumes turns.           |
| Stairwell     | A mistake resets the `stairStep` variable to 0, wasting critical turns. |
| After turn 30 | Completing the stairwell puzzle triggers the bad ending.                |
| Final Door    | The door handler checks `turns > 30`.                                   |

**Ending:** You push the heavy metal door open expecting to see the parking garage. Instead, the hum of a fluorescent light blinds you. You are standing inside your own cubicle. Your computer clock reads 3:14 AM. You have just sat down. The loop is eternal. **GAME OVER.**

---

## The Lost Path

The player fails to deduce or accidentally discover the strange stairwell sequence. Simply continuing downward forever (`down`, `down`, `down`...) silently resets the stairwell counter back to 0.

| Behavior              | Detail                                                                                                                           |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Wrong direction       | `stairStep` resets to 0. A message about sealed-off doors appears.                                                               |
| Sense of pursuit      | With every mistake in the sequence, the game describes the sound of *footsteps descending behind you*, growing faster each time. |
| Rotating descriptions | The floor number painted on the wall changes nonsensically (Floor 12, Floor 4, Floor 99, Floor -1).                              |

**Ending:** You keep descending. And descending. Your knees shake from exhaustion. The red emergency light is your only companion. The footsteps from above are now on the same flight of stairs as you. And you are still going down.

---

## Technical Implementation (Architecture Guide)

To add this story cleanly into your engine, you would only need to create a new directory: `src/stories/night-shift/`.

1. **`types.ts` (Local State):** You would add story-specific flags to your general `GameState`, or manage the state inside the handler itself, for example: `hasKeycard`, `stairStep`, and `isInStairwell`.
2. **`index.ts`:** Would export the object implementing your `Story` interface, injecting the title, initial description, and predefined paths for the `DevPanel`.
3. **`handlers.ts`:** Your responsibility chain (`chain`) would contain interceptors similar to the forest story:

   * A `stairwellHandler` that captures any movement command (`down`, `up`) while `isInStairwell` is true.
   * If the command matches the current index of `STAIR_SEQUENCE`, increment `stairStep` and return the corresponding text effects (`GameEffect[]`).
   * If it fails, emit an effect resetting `stairStep` back to 0 and display a disturbing message.
   * Once the maximum sequence length is reached, emit the effect that changes the location to the final area and evaluate `turns > 30` to trigger the terror ending.

---

## TODO
añadir un sistema para que el jugador pueda encontrar pistas
añadir notas de lore que el jugador pueda encontrar