# Blind Line

## Summary

You fell asleep on the last subway train of the night. When you open your eyes, the carriage is empty and completely dark. The doors slide open with a pneumatic hiss, and you step onto a bare concrete platform. The station sign has been ripped off, and the walls sweat with moisture. The main exit gate has been welded shut. The only path forward is down onto the tracks and into the maintenance tunnels. Something else is breathing in the darkness, and it hates the light.

**Locations:** Platform → Dead Tracks → Maintenance Tunnels → Surface Grate

**Victory Condition:** Reach the grate in ≤ 28 turns.

**Defeat Condition:** Reach the grate in > 28 turns (The Colony).

**Lost Condition:** Become trapped in the circular tunnels (a navigation mistake sends you back to the beginning of the tunnels).

---

## The Happy Path

You manage to reach the surface before the colony surrounds you in the darkness (28 turns or less). The tunnel sequence (`N E N W N N E`) requires following cold air currents and strange chalk markings.

| Step | Command             | Result                                                                                       |
| ---- | ------------------- | -------------------------------------------------------------------------------------------- |
| 1    | `look platform`     | You see trash, the welded gate, and an open control panel containing an emergency **flare**. |
| 2    | `take flare`        | Red flare (unlit) added to inventory.                                                        |
| 3    | `climb down tracks` | You jump from the platform. The echo of your footsteps is deafening.                         |
| 4    | `light flare`       | Red light floods the tunnel. You hear shrieks retreating into the distance.                  |
| 5    | `north`             | Step 1/7. You enter the main tunnel. Loose cables hang from the ceiling.                     |
| 6    | `east`              | Step 2/7. You turn into a narrow passageway. It smells like rust.                            |
| 7    | `north`             | Step 3/7. Water rises to your ankles.                                                        |
| 8    | `west`              | Step 4/7. You notice claw marks scratched into the brick walls.                              |
| 9    | `north`             | Step 5/7. You feel a stream of cold air against your face.                                   |
| 10   | `north`             | Step 6/7. The flare begins sputtering, losing strength.                                      |
| 11   | `east`              | YOU ESCAPED THE TUNNELS → Surface Grate.                                                     |

**Ending:** Moonlight filters through a heavy sewer grate above your head. You shove upward with all your strength until it finally moves. You stumble out and collapse onto the rain-soaked asphalt of an alley in the middle of the city. A taxi horn snaps you back to reality. Before sealing the grate shut, you glance down into the darkness and see dozens of blind white eyes glowing beneath the dying light of your flare. You are safe.

---

## The Terror Path

The player wastes time trying to force open the platform gate, searching through trash bins, or repeatedly taking wrong tunnels. The 28 turns run out.

| Phase         | What Happens                                                                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform      | Every wasted turn makes the emergency lights flicker faster.                                                                                   |
| Tunnels       | Wrong turns consume a turn and reset progress. The flare weakens as turns pass.                                                                |
| After turn 28 | "The Colony" has already surrounded your position in the darkness. The engine waits until you complete the sequence to deliver the final blow. |
| Surface Grate | `enterGrateEffects` evaluates `turnsAfterDescent > 28`.                                                                                        |

**Ending:** You reach the grate and see streetlight shining above. You raise your arms to push the metal aside, but something cold and bony grabs your ankle. Then another hand clamps around your wrist. You pull desperately, but dozens of pale, thin arms emerge from the sewage water below. They drag you backward, away from the light. The sound of the city fades, replaced by the noise of snapping jaws in absolute darkness. **GAME OVER.**

---

## The Lost Path

The tunnel network does not follow Euclidean logic. If the player fails the sequence (`N E N W N N E`), their internal progress resets to 0, but the engine describes it as though they are venturing deeper and deeper underground.

| Behavior        | Detail                                                                                                                             |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Wrong direction | `tunnelStep` resets. You remain trapped inside the underground maze.                                                               |
| Fading light    | After turn 15 inside the tunnels, the text begins describing the flare slowly dying, reducing visibility to only a few feet ahead. |
| Spatial audio   | Using `useTypewriter`, you can add pauses in the text (example: `... [pause] ...`) to simulate echoes the player must listen to.   |

**Rotating descriptions of underground madness:**

1. *"You follow the tracks, but suddenly they end against a solid concrete wall. You have to turn back."*
2. *"You pass a rusted, derailed subway car. Inside, it looks like silhouettes are still sitting and waiting."*
3. *"Murky water rises to your knees. Something thick and leathery brushes against your leg beneath the surface."*
4. *"You find your own wet footprints on the ground, except they are pointing the opposite direction."*
5. *"The silence breaks with the sound of a distorted station announcement: 'Next stop... the bottom.'"*

---

## Implementation Notes

Like the other stories, the component structure makes this very easy to add:

* **Audio/visual puzzle:** You can add a boolean flag such as `hasFlare` or `flareLit`. If the player enters the tunnels without lighting the flare, any tunnel movement results in instant death (immediate Game Over) because they stumble or are ambushed in the dark. This adds an extra layer of preparation before entering the maze.
* **Inventory:** You could require the player to use a `crowbar` or `pipe` to open an electrical panel on the platform in order to retrieve the flare.

---

## TODO
añadir un sistema para que el jugador pueda encontrar pistas
añadir notas de lore que el jugador pueda encontrar