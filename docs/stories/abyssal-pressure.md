# Abyssal Pressure

## Summary

You are the sole crew member aboard the research bathyscaphe *Nereus-IV*, descending into the Mariana Trench. At 9,000 meters deep, a dull impact shakes the vessel. The umbilical cable connecting you to the surface snaps. The main lights die. The quartz glass of the cockpit groans beneath 1,000 atmospheres of pressure. You must use the emergency thrusters to blindly navigate through a maze of hydrothermal vent columns and reach open water before the hull implodes. The problem is that, in the absolute darkness of the abyss, the sonar has just detected something organic. And it is enormous.

**Locations:** Main Cabin → Hydrothermal Field (The Abyss) → Surface

**Victory Condition:** Escape the hydrothermal field and reach the surface in ≤ 20 turns (oxygen and hull integrity are critical).

**Defeat Condition:** Escape in > 20 turns (The Leviathan).

**Lost Condition:** Crash into rock formations or take the wrong thermal current in the abyss (a mistake resets navigation progress).

---

## The Happy Path

You manage to reach open water and eject the ballast before the hull collapses or the creature intercepts you (20 turns or less). The navigation sequence through the black smoker vents (`up`, `north`, `east`, `up`, `north`, `up`) requires interpreting thermal currents.

| Step | Command          | Result                                                                              |
| ---- | ---------------- | ----------------------------------------------------------------------------------- |
| 1    | `look panel`     | The systems are dead. A **fuse** is missing from the ignition panel.                |
| 2    | `take fuse`      | Spare fuse retrieved from the toolbox.                                              |
| 3    | `use fuse panel` | Auxiliary power restored. The sonar emits a green ping.                             |
| 4    | `up`             | Step 1/6. The bathyscaphe slowly rises. You avoid the ocean floor.                  |
| 5    | `north`          | Step 2/6. You navigate between two columns of boiling black smoke.                  |
| 6    | `east`           | Step 3/6. A thermal current pushes the vessel sideways. The hull groans (`CLANK!`). |
| 7    | `up`             | Step 4/6. You leave a massive anomaly behind on the radar.                          |
| 8    | `north`          | Step 5/6. The water grows colder. You are leaving the trench.                       |
| 9    | `up`             | Step 6/6. Clear route ahead!                                                        |
| 10   | `eject ballast`  | YOU ESCAPED THE ABYSS → Surface.                                                    |

**Ending:** The bathyscaphe rockets toward the surface like a cork. You burst through the water with a deafening roar. Morning sunlight floods the cabin through the thick quartz glass. The radio crackles back to life with static, and you hear the frantic voices of the mothership searching for you. You are safe. You will never go near the ocean again.

---

## The Terror Path

The player wastes time repairing the panel, attempting radio communication, or taking wrong turns in the abyss. The 20 turns run out. Hull integrity drops too low, and the creature locks onto the vessel.

| Phase         | What Happens                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Cabin         | Every useless action causes the glass to emit a sharp, terrifying whine. The pressure increases.                                     |
| The Abyss     | Mistakes reset your position. The sonar warns of a "Leviathan-class biological contact" approaching.                                 |
| After turn 20 | You have made too much noise. The entity has already reached you, but the engine waits until the sequence is completed to reveal it. |
| Surface       | `enterSurfaceEffects` checks `turns > 20`.                                                                                           |

**Ending:** The bathyscaphe ascends at full speed and bursts through the surface. You exhale in relief, but something is wrong. There is no sun. The sky is fleshy purple, wet, and ribbed. There is no horizon, only pale jagged walls towering around you, dripping saliva. You look through the upper hatch and understand, one second before the "sky" slams shut and darkness returns, that you never left the water. You were swallowed. **GAME OVER.**

---

## The Lost Path

The player fails to follow the three-dimensional route (`U N E U N U`). Any navigation mistake collides the vessel with violent currents, forcing it to descend again to avoid destruction, which internally resets `abyssStep` back to 0.

| Behavior           | Detail                                                                                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wrong direction    | `abyssStep` resets to 0. A message warns that a violent current or massive obstacle has pushed you off course.                                                    |
| Audio anxiety      | The text output should focus heavily on sound: the sonar pulse (`*PING*...`), the groaning metal under crushing pressure, and guttural noises outside the vessel. |
| Pressure indicator | You can periodically print simulated system warnings such as: `[SYSTEM] HULL INTEGRITY: 84%...`                                                                   |

**Rotating descriptions of underwater panic:**

1. *"The sonar detects an object the size of a skyscraper passing only meters off the starboard side. The water vibrates."*
2. *"You hear metallic scraping against the outer glass. There is nothing outside, but the window now bears a long scratch."*
3. *"A cloud of black smoke from a vent blinds you completely. The external lights are useless. You are drifting in circles."*
4. *"The thermal scanner detects an extreme temperature drop. Something is absorbing the heat from the surrounding water."*
5. *"`PING!` ... [long pause] ... `PING!` The returning echo forms the outline of colossal tentacles wrapped around the rock formations below."*

---

## Implementation Notes (Architecture)

* **Expanded commands:** For this level, your `parser.ts` should accept commands such as `eject ballast`, `drop weight`, or vertical-axis movement (`up`, `down`, `ascend`, `descend`). This adds a lot of depth to your engine instead of limiting it to only N/S/E/W.
* **GSAP visual effects:** During this specific story, you could slightly alter the color or speed of `useTypewriter`. For example, when hull integrity is low or the creature is nearby, the text could appear more slowly or with subtle "glitches" to simulate the vessel losing power.

---

## TODO
añadir un sistema para que el jugador pueda encontrar pistas
añadir notas de lore que el jugador pueda encontrar