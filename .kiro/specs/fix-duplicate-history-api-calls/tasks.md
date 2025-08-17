# Implementation Plan

- [ ] 1. Move helper functions outside the useAsyncTasks hook
  - Extract `getProgressForStatus` and `getMessageForStatus` functions to module level
  - Remove these functions from inside the hook to prevent recreation on every render
  - _Requirements: 2.2, 2.3_

- [ ] 2. Add loading guard to prevent duplicate history calls
  - Add `isHistoryLoadedRef` useRef to track if history has been loaded
  - Implement guard check at the beginning of `loadHistoryTasks` function
  - Set the guard flag after successful history loading
  - _Requirements: 1.1, 1.2_

- [ ] 3. Stabilize loadHistoryTasks callback dependencies
  - Remove unstable dependencies from `loadHistoryTasks` useCallback
  - Ensure only stable callbacks like `startListening` are in dependency array
  - Remove helper functions from dependencies since they're now module-level
  - _Requirements: 2.2, 2.3_

- [ ] 4. Test the fix and verify single API call
  - Test page refresh behavior in browser network tab
  - Verify only one `/api/tasks/history` call is made
  - Confirm all existing functionality still works (task submission, status updates, SSE connections)
  - Test that task history loads correctly after the optimization
  - _Requirements: 1.1, 1.3, 3.1, 3.2, 3.3_