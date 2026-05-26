import tentArt from "./panels/tent-art.txt?raw";

export const MAPS: Record<string, string> = {
  tent: tentArt,

  forest: String.raw`
  ^      ^      ^      ^      ^      ^      ^      ^      ^      ^
 /T\    /T\    /T\    /T\    /T\    /T\    /T\    /T\    /T\    /T\
  |      |      |      |      |      |      |      |      |      |
       {F:.}          {F:'}          {F:,}          {F:;}          {F:.}          {F:'}
  ^      ^      ^      ^      ^      ^      ^      ^      ^      ^
 /T\    /T\    /T\    /T\    /T\    /T\    /T\    /T\    /T\    /T\
  |  {F:'}   |   {F:.}  |  {F:,}   |   {F:;}  |  {F:.}   |   {F:'}  |  {F:,}   |   {F:.}  |  {F:;}   |
       {F:,}          {F:;}          {F:.}          {F:'}          {F:,}          {F:.}
  ^      ^      ^      ^      {P}      ^      ^      ^      ^      ^
 /T\    /T\    /T\    /T\    /|\    /T\    /T\    /T\    /T\    /T\
  |   {F:.}  |  {F:,}   |   {F:'}  |  {F:.}   {D:you}    |   {F:;}  |  {F:,}   |  {F:'}   |   {F:.}  |
       {F:;}          {F:'}          {F:.}          {F:,}          {F:;}          {F:'}
  ^      ^      ^      ^      ^      ^      ^      ^      ^      ^
 /T\    /T\    /T\    /T\    /T\    /T\    /T\    /T\    /T\    /T\
  |  {F:,}   |  {F:'}   |   {F:.}  |  {F:;}   |  {F:,}   |  {F:'}   |   {F:.}  |  {F:;}   |  {F:,}   |
       {F:'}          {F:.}          {F:;}          {F:'}          {F:.}          {F:,}
  ^      ^      ^      ^      ^      ^      ^      ^      ^      ^
 /T\    /T\    /T\    /T\    /T\    /T\    /T\    /T\    /T\    /T\
  |      |      |      |      |      |      |      |      |      |

         {D:~ the trees look identical in every direction ~}
         {D:~ you cannot see the sky through the canopy   ~}
`,

  road: String.raw`
  {F:|}    {F:|}    {F:|}    {F:|}    {F:|}    {F:|}    {F:|}    {F:|}    {F:|}    {F:|}
 {F:/|\}  {F:/|\}  {F:/|\}  {F:/|\}  {F:/|\}  {F:/|\}  {F:/|\}  {F:/|\}  {F:/|\}  {F:/|\}
  {F:|}    {F:|}  {F:.}  {F:|}    {F:|}  {F:,}  {F:|}    {F:|}  {F:;}  {F:|}    {F:|}  {F:'}  {F:|}
       {F:.}          {F:'}          {F:,}          {F:;}          {F:.}
  {F:|}    {F:|}    {F:|}    {F:|}    {F:|}    {F:|}    {F:|}    {F:|}    {F:|}    {F:|}
 {F:/|\}  {F:/|\}  {F:/|\}  {F:/|\}  {F:/|\}  {F:/|\}  {F:/|\}  {F:/|\}  {F:/|\}  {F:/|\}
  {F:|}    {F:|}    {F:|}    {F:|}    {F:|}    {F:|}    {F:|}    {F:|}    {F:|}    {F:|}

  ====================== {D:cracked asphalt} ========================
  = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
                                                  {D:crack}
  =============================================   /  ===============
                        {D:crack}
  ========================================  /  ====================

         .------.   .-------.
        /  O  O  \ /  {LBL:YOUR CAR}  \
       |  ------  |  -------  |
       |__________|___________|
        |  |  |  |  |  |  |
  ------'--'--'--'--'--'--'--'--------------------------------------
                        {P}
                     {D:<- you}

  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

         {D:~ the car is just ahead ~}
         {D:~ do not look at the tree line ~}
`,

  ending_win: String.raw`

    {F:|}   {F:|}   {F:|}   {F:|}   {F:|}   {F:|}   {F:|}   {F:|}   {F:|}   {F:|}   {F:|}
   {F:/|\} {F:/|\} {F:/|\} {F:/|\} {F:/|\} {F:/|\} {F:/|\} {F:/|\} {F:/|\} {F:/|\} {F:/|\}
  {N:/ | \}{N:/ | \}{N:/ | \}{N:/ | \}{N:/ | \}{N:/ | \}{N:/ | \}{N:/ | \}{N:/ | \}{N:/ | \}{N:/ | \}
   {N:| | |}{N:| | |}{N:| | |}{N:| | |}{N:| | |}{N:| | |}{N:| | |}{N:| | |}{N:| | |}{N:| | |}{N:| | |}
   {N:|_|_|}{N:|_|_|}{N:|_|_|}{N:|_|_|}{N:|_|_|}{N:|_|_|}{N:|_|_|}{N:|_|_|}{N:|_|_|}{N:|_|_|}{N:|_|_|}

  ================================================= {D:old forest road}
  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

                                   .-------.
                                  /  O   O  \   {D:==>}
                                 |  -------  |
                                 |___________|
                                  | | | | | |
  ================================='-'-'-'-'-'===================>

         {D:~ the figures watch until your headlights disappear ~}

         {LBL:Y O U   S U R V I V E D}
`,

  ending_presence: String.raw`

      {F:|}        {F:|}        {F:|}        {F:|}        {F:|}
     {F:/|\}      {F:/|\}      {F:/|\}      {F:/|\}      {F:/|\}
    {F:/|||\}    {F:/|||\}    {F:/|||\}    {F:/|||\}    {F:/|||\}
      {F:| |}      {F:| |}      {F:| |}      {F:| |}      {F:| |}
    {N:/ | | \}  {N:/ | | \}  {N:/ | | \}  {N:/ | | \}  {N:/ | | \}
      {N:| | |}    {N:| | |}    {N:| | |}    {N:| | |}    {N:| | |}
      {N:|_|_|}    {N:|_|_|}    {N:|_|_|}    {N:|_|_|}    {N:|_|_|}


          {LBL:T H E   P R E S E N C E   H A S   W O N}
`,
};

export function renderMapTokens(raw: string): string {
  return raw
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("{P}", '<span class="player">@</span>')
    .replaceAll("{K}", '<span class="note">K</span>')
    .replaceAll("{N}", '<span class="note">N</span>')
    .replace(/\{N:([^}]+)\}/g, '<span class="note">$1</span>')
    .replace(/\{LBL:([^}]+)\}/g, '<span class="label">$1</span>')
    .replace(/\{D:([^}]+)\}/g, '<span class="dim">$1</span>')
    .replace(/\{F:([^}]+)\}/g, '<span class="faint">$1</span>');
}
