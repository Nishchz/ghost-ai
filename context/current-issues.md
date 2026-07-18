# Current Issues

## Error Type
Console Error

## Error Message
Save failed: 500


    at useCanvasAutosave.useCallback[save] (hooks/useCanvasAutosave.ts:52:17)

## Code Frame
  50 |
  51 |         if (!response.ok) {
> 52 |           throw new Error(`Save failed: ${r...
     |                 ^
  53 |         }
  54 |
  55 |         lastSavedRef.current = snapshot;

Next.js version: 16.2.10 (Turbopack)


auto save function work properly but this error shown fix it .