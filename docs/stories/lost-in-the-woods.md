# Lost in the Woods

## Summary

You wake up in the middle of the night inside your tent. The cold feels unnatural, and your breath forms clouds of vapor. Outside, in the absolute darkness of the Akasawa forest, something heavy has just stepped on a dry branch. It is circling your tent. You have no signal. You need to reach the old forest road where you left your car. And you need to do it now.

**Locations:** Tent → Deep Forest → Forest Road

**Victory Condition:** Reach the road in ≤ 25 turns.

**Defeat Condition:** Reach the road in > 25 turns (The Presence).

**Lost Condition:** Walking in circles through the forest (a wrong direction resets your progress and throws you back into the wilderness).

---

## The Happy Path

You escape the forest before the entity finishes its "game" with you (25 turns or less). The forest sequence (`N N E N E S W N N E`) must be completed without mistakes.

| Step | Command           | Result                                                                  |
| ---- | ----------------- | ----------------------------------------------------------------------- |
| 1    | `take flashlight` | Flashlight added to inventory. Its beam is weak.                        |
| 2    | `leave tent`      | You step into the cold. You feel something watching you from the trees. |
| 3    | `north`           | Step 1/10. The undergrowth is dense. You start running.                 |
| 4    | `north`           | Step 2/10. Your breathing becomes ragged.                               |
| 5    | `east`            | Step 3/10. You dodge a rotting log.                                     |
| 6    | `north`           | Step 4/10. You hear branches cracking to your left.                     |
| 7    | `east`            | Step 5/10. The flashlight beam trembles in your hands.                  |
| 8    | `south`           | Step 6/10. You slide down a muddy embankment.                           |
| 9    | `west`            | Step 7/10. Suddenly, the silence is absolute. Not even crickets.        |
| 10   | `north`           | Step 8/10. You spot an opening between the pines.                       |
| 11   | `north`           | Step 9/10. You smell wet asphalt and soil.                              |
| 12   | `east`            | YOU ESCAPED THE FOREST → Forest Road.                                   |

**Ending:** The forest spits your body onto cracked asphalt. A few meters away sits your car. You jump inside, lock the doors, and turn the key. When the headlights flare on, they illuminate the tree line. For a split second, you see dozens of tall figures made of branches standing at the edge of the woods, watching. You slam the accelerator and never look in the rearview mirror. You survived.

---

## The Terror Path

The player wastes too much time in the tent (`look backpack`, `wait`), repeatedly makes mistakes in the forest, and crosses the 25-turn threshold.

| Phase         | What Happens                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Tent          | Turns pass. If you take too long to leave, the text warns you: *"A tall shadow stretches across the fabric of the tent."*      |
| Deep Forest   | Every wrong direction costs a turn and resets your progress. The presence gets closer.                                         |
| After turn 25 | It is already too late, even if you do not realize it yet. The next time you complete the sequence, the fatal ending triggers. |
| Forest Road   | `enterRoadEffects` detects `turns > 25`.                                                                                       |

**Ending:** At last, your boots hit the asphalt of the old road. You reach your car, but the driver’s door has been ripped clean off. On the seat sits a pile of stones stacked with unnatural precision. Suddenly, you hear your own voice, recorded and distorted, echoing from the darkness behind you: *"Hello? Is anyone there?"* The flashlight flickers and dies. You hear rapid footsteps sprinting toward you. **GAME OVER.**

---

## The Lost Path

The player fails to input the exact sequence. Any mistake in the route coordinates (`N N E N E S W N N E`) silently resets `forestStep` back to 0.

| Behavior              | Detail                                                                                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wrong direction       | `forestStep` resets to 0 silently. The player remains in the "Deep Forest."                                                                              |
| Visual disorientation | The output text (`useTypewriter`) describes trees that all look the same, thickening fog, or the player stumbling over the same roots again and again.   |
| Folk horror elements  | Every time progress resets (when the player fails), the description changes using the modulo operator (`%`) on the turn count, revealing subtle horrors. |
| Infinite loop         | There is no direct death from being lost, but the tension rises endlessly.                                                                               |

**Rotating descriptions when lost (Examples for the engine):**

1. *"You keep walking, but you could swear you already passed this same twisted pine tree."*
2. *"The flashlight beam catches something hanging from a branch: a humanoid figure made of sticks and filthy rope."*
3. *"You find three stones stacked on the ground. You did not place them there. Something is guiding you in circles."*
4. *"Far away, you hear a child crying. It sounds wrong, as if something is imitating the noise."*
5. *"You check the compass, but the needle spins wildly without stopping. You are completely disoriented."*
