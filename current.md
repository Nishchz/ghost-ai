I have deployed my Next.js project to Vercel, but I am facing two major UI/responsiveness issues that need immediate fixing:

1. *Mobile Layout Issue (Canvas / Floating Toolbar):*
   - On mobile screens, the floating toolbar/controls at the bottom (containing zoom/pan/undo/redo buttons and shapes) are pushed way too low or overlapping with the screen gestures/edges. 
   - Please adjust the CSS/Tailwind classes (e.g., fixed positioning, bottom offsets, safe-area-inset) so it stays properly positioned and accessible on mobile viewports.

2. *Share Modal Layout Clipping:*
   - In the "Share Architecture Project" modal, the elements on the right side (such as the "Invite" button and notification indicators) are getting clipped, hidden, or pushed out of bounds because of fixed container widths or lack of flex-wrap.
   - Please fix the modal's internal layout (flexbox/grid) to ensure proper responsiveness, wrapping, and that all text/buttons fit cleanly inside the container without overflowing.

Please inspect the relevant component files and provide the corrected code.