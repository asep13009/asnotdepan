# TODO List for Blob Image Display Fix

## Completed Tasks
- [x] Update interface in AttendanceContext.tsx to use photo_in/photo_out instead of photoUrl_in/photoUrl_out
- [x] Add state to track object URLs for cleanup
- [x] Modify fetchTodayAttendance to convert Blob or base64 string to displayable URL
- [x] Add cleanup useEffect to revoke object URLs on unmount
- [x] Fix infinite re-render issue by removing objectUrls from useCallback dependency
- [x] Remove 'ngrok-skip-browser-warning' header to fix 431 error
- [x] Move token to query parameter to avoid 431 error

## Followup Steps
- [ ] Test the image display in the AttendanceDisplay component
- [ ] Verify no memory leaks by checking browser dev tools
- [ ] Ensure images load correctly when data is fetched
