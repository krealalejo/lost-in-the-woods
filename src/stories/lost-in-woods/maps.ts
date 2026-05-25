export const MAPS: Record<string, string> = {
  house: `
   .------------------------------------------------------------.
   |          {LBL:2nd floor: ATTIC}   [{D:^}] ladder hatch up         |
   |============================================================|
   |                            |                               |
   |   {LBL:LIVING ROOM}              |        {LBL:KITCHEN}                 |
   |                            |                               |
   |   .-----------. .----.     |   .--------. .------.         |
   |   |   SOFA    | | TV |     |   | FRIDGE | | SINK |         |
   |   '-----------' |::::|     |   |[ {N}OTE ]| |  (o) |         |
   |                 '----'     |   '--------' '------'         |
   |   .--.  .-----------.      |                               |
   |   |LM|  |    RUG    |      |   .---------------.           |
   |   |MP|  | / / / / / |      |   |     TABLE     |           |
   |   '--'  '-----------'      |   |   [{K}] {D:<- keys}  |           |
   |                            |   '---------------'           |
   |       {P}  {D:<- YOU}              |                               |
   |                            |   [c] [c] [c] [c] {D:chairs}        |
   |   .---.                    |                               |
   |   ||||  {D:stairs up}          |                               |
   |   '---'                    |                               |
   |                            |                               |
   '=======[ {LBL:FRONT DOOR} ]========+========[ {LBL:BACK DOOR} ]========'
                ||
                vv
         {D:to the driveway -> road}
`,

  forest: `
  ^      ^      ^      ^      ^      ^      ^      ^      ^      ^
 /T\\    /T\\    /T\\    /T\\    /T\\    /T\\    /T\\    /T\\    /T\\    /T\\
  |      |      |      |      |      |      |      |      |      |
       {F:.}          {F:'}          {F:,}          {F:;}          {F:.}          {F:'}
  ^      ^      ^      ^      ^      ^      ^      ^      ^      ^
 /T\\    /T\\    /T\\    /T\\    /T\\    /T\\    /T\\    /T\\    /T\\    /T\\
  |  {F:'}   |   {F:.}  |  {F:,}   |   {F:;}  |  {F:.}   |   {F:'}  |  {F:,}   |   {F:.}  |  {F:;}   |
       {F:,}          {F:;}          {F:.}          {F:'}          {F:,}          {F:.}
  ^      ^      ^      ^      {P}      ^      ^      ^      ^      ^
 /T\\    /T\\    /T\\    /T\\    /|\\    /T\\    /T\\    /T\\    /T\\    /T\\
  |   {F:.}  |  {F:,}   |   {F:'}  |  {F:.}   {D:you}    |   {F:;}  |  {F:,}   |  {F:'}   |   {F:.}  |
       {F:;}          {F:'}          {F:.}          {F:,}          {F:;}          {F:'}
  ^      ^      ^      ^      ^      ^      ^      ^      ^      ^
 /T\\    /T\\    /T\\    /T\\    /T\\    /T\\    /T\\    /T\\    /T\\    /T\\
  |  {F:,}   |  {F:'}   |   {F:.}  |  {F:;}   |  {F:,}   |  {F:'}   |   {F:.}  |  {F:;}   |  {F:,}   |
       {F:'}          {F:.}          {F:;}          {F:'}          {F:.}          {F:,}
  ^      ^      ^      ^      ^      ^      ^      ^      ^      ^
 /T\\    /T\\    /T\\    /T\\    /T\\    /T\\    /T\\    /T\\    /T\\    /T\\
  |      |      |      |      |      |      |      |      |      |

         {D:~ the trees look identical in every direction ~}
         {D:~ you cannot see the sky through the canopy   ~}
`,

  clearing: `
  ^     ^     ^                                          ^     ^
 /T\\   /T\\   /T\\        {F:.   .   .   .   .   .}          /T\\   /T\\
  |     |     |                                          |     |
                      .-------------------.
                     /                     \\
  ^      {F:.}            |     .---------.      |          {F:.}        ^
 /T\\                 |    /  {LBL:MOON}     \\     |                  /T\\
  |         {F:.}        |   |    full     |    |       {F:.}            |
                     |    \\           /    |
                      \\    '---------'    /
  ^                    '-------------------'                      ^
 /T\\                                                            /T\\
  |        {F:.}                {P}                  {F:.}                |
                            {D:(player)}

  ^                {F:.   .   .   .   .   .   .   .}                ^
 /T\\                                                            /T\\
  |                                                              |

           {D:~ far away: blinking red runway lights ~}

  ^     ^     ^                                          ^     ^
 /T\\   /T\\   /T\\                                        /T\\   /T\\
`,

  ending_vampires: `

         ___          ___          ___          ___          ___
       _/   \\_      _/   \\_      _/   \\_      _/   \\_      _/   \\_
      / {N:o   o} \\    / {N:o   o} \\    / {N:o   o} \\    / {N:o   o} \\    / {N:o   o} \\
     |   \\_/   |    |   \\_/   |    |   \\_/   |    |   \\_/   |    |   \\_/   |
      \\__^__/        \\__^__/        \\__^__/        \\__^__/        \\__^__/
        | |            | |            | |            | |            | |
        |_|            |_|            |_|            |_|            |_|


           {LBL:T H E   V A M P I R E S   H A V E   W O N}
`,
};

export function renderMapTokens(raw: string): string {
  return raw
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\{P\}/g, '<span class="player">@</span>')
    .replace(/\{K\}/g, '<span class="note">K</span>')
    .replace(/\{N\}/g, '<span class="note">N</span>')
    .replace(/\{N:([^}]+)\}/g, '<span class="note">$1</span>')
    .replace(/\{LBL:([^}]+)\}/g, '<span class="label">$1</span>')
    .replace(/\{D:([^}]+)\}/g, '<span class="dim">$1</span>')
    .replace(/\{F:([^}]+)\}/g, '<span class="faint">$1</span>');
}
