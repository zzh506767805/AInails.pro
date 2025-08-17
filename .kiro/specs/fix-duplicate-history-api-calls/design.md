# Design Document

## Overview

The duplicate history API calls are occurring due to dependency issues in the `useAsyncTasks` hook. The `loadHistoryTasks` function is being recreated on every render because of unstable dependencies, causing the `useEffect` to re-run and make additional API calls.

## Architecture

The fix involves optimizing the `useAsyncTasks` hook by:
1. Moving helper functions outside the component to prevent recreation
2. Stabilizing the `loadHistoryTasks` callback dependencies
3. Adding a loading guard to prevent concurrent history requests
4. Implementing proper memoization for callback functions

## Components and Interfaces

### Current Issue Analysis

The main issues identified:

1. **Helper Functions Inside Hook**: `getProgressForStatus` and `getMessageForStatus` are recreated on every render
2. **Unstable Dependencies**: `loadHistoryTasks` callback has unstable dependencies causing re-execution
3. **Missing Loading Guard**: No protection against concurrent history loading requests
4. **Dependency Chain**: The `useEffect` dependency on `loadHistoryTasks` causes re-execution

### Proposed Solution

```typescript
// Move helper functions outside the hook
const getProgressForStatus = (status: string): number => { ... }
const getMessageForStatus = (status: string): string => { ... }

export function useAsyncTasks() {
  // Add loading guard
  const isHistoryLoadedRef = useRef(false)
  
  // Stabilize loadHistoryTasks with proper dependencies
  const loadHistoryTasks = useCallback(async () => {
    if (isHistoryLoadedRef.current) return // Prevent duplicate calls
    // ... implementation
  }, [startListening]) // Only depend on stable callbacks
}
```

## Data Models

No changes to existing data models are required. The `AsyncTask` and `TaskStatus` interfaces remain unchanged.

## Error Handling

The existing error handling in the hook will be preserved. Additional error handling will be added to:
- Handle concurrent loading attempts gracefully
- Log when duplicate calls are prevented
- Maintain error states properly during optimization

## Testing Strategy

### Unit Tests
- Test that `loadHistoryTasks` is called only once per hook instance
- Verify helper functions work correctly when moved outside
- Test loading guard prevents concurrent requests

### Integration Tests  
- Verify page refresh results in single history API call
- Test that all existing functionality remains intact
- Confirm SSE connections still work properly for active tasks

### Manual Testing
- Monitor network tab during page refresh
- Verify task history loads correctly
- Test task submission and status updates still work
- Confirm no regression in existing features