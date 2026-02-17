# RenderQueuePlus Code Architecture

## Module Structure

### Utility Modules (Load First)
These modules provide foundational functionality and must be loaded before core modules.

1. **constants.jsx** - Global constants
   - Padding constants (PADDING_5_DIGITS, etc.)
   - String length constants
   - Byte size constants
   - Render queue constants

2. **polyfills.jsx** - JavaScript polyfills for ExtendScript
   - JSON.parse() and JSON.stringify()
   - String.prototype.trim()
   - Array.prototype.indexOf()

3. **stringutils.jsx** - String manipulation
   - `getPadding(n)` - Extract padding from string
   - `getPaddingFromName(inString)` - Get digit count from filename
   - `getFrameNumberFromName(inString)` - Extract frame number
   - `getVersionNumberFromString(inString)` - Extract version number
   - `pad(a, b)` - Add leading zeros
   - `ellipsis(inString, length)` - Clip string with ellipsis
   - `fileNameSafeString(str)` - Convert to filename-safe string

4. **arrayutils.jsx** - Array operations
   - `uniq(a)` - Get unique values
   - `getArrayFromRange(string, limit)` - Convert range string to array
   - `getRanges(array)` - Convert array to range string

5. **formatutils.jsx** - Formatting functions
   - `formatBytes(a, b)` - Format bytes to human-readable string

6. **errorhandler.jsx** - Error handling
   - `alertScroll(title, input)` - Display scrollable alert dialog
   - `catchError(e)` - Custom error handler with detailed output

### Core Modules

7. **platform.jsx** - Platform detection and OS-specific operations
   - Platform class for Windows/Mac detection
   - OS-specific path handling
   - Shell command generation

8. **platformsingleton.jsx** - Platform singleton wrapper
   - `getPlatform()` - Returns singleton Platform instance
   - **IMPORTANT:** Always use `getPlatform()` instead of `new Platform()`

9. **common.jsx** - After Effects specific helpers
   - `importFootage()` - Import footage with folder structure
   - `reveal(p)` - Reveal file/folder in OS
   - `openLink(url)` - Open URL in browser
   - `setRenderQueueItemDefaults()` - Configure render queue items
   - `isObjectEmpty(o)` - Check if object is empty
   - `numOutputModules()` - Count output modules
   - `aerenderOkToStart()` - Validate render queue state

### UI Modules

10. **icons.jsx** - Icon definitions
11. **progressbar.jsx** - Progress bar UI component
12. **pathcontrol.jsx** - Path control UI component

### Business Logic Modules

13. **data.jsx** - Data management and file scanning
14. **directory.jsx** - Directory operations wrapper
15. **ffmpeg.jsx** - FFmpeg integration
16. **settings.jsx** - Settings management
17. **taskmanager.jsx** - Process management
18. **taskmanagerUI.jsx** - Task manager UI
19. **aeparchive.jsx** - Project archiving
20. **framewindow.jsx** - Frame inspector window
21. **mainwindow.jsx** - Main UI window and orchestration

## Load Order (main.jsx)

```javascript
// Utility modules (must be loaded first)
// @include "constants.jsx"
// @include "polyfills.jsx"
// @include "stringutils.jsx"
// @include "arrayutils.jsx"
// @include "formatutils.jsx"
// @include "errorhandler.jsx"

// Core modules
// @include "platform.jsx"
// @include "platformsingleton.jsx"
// @include "common.jsx"
// @include "icons.jsx"
// @include "settings.jsx"
// @include "directory.jsx"
// @include "progressbar.jsx"
// @include "data.jsx"
// @include "framewindow.jsx"
// @include "pathcontrol.jsx"
// @include "ffmpeg.jsx"
// @include "mainwindow.jsx"
// @include "aeparchive.jsx"
// @include "taskmanager.jsx"
// @include "taskmanagerUI.jsx"
```

## Key Patterns

### Platform Singleton Pattern
**Always use `getPlatform()` instead of `new Platform()`**

```javascript
// ✅ Correct
var platform = getPlatform();

// ❌ Wrong - creates duplicate instance
var platform = new Platform();
```

### Helper Functions in mainwindow.jsx

Three helper functions reduce code duplication:

1. **getCurrentOutputModule()** - Get output module for selected item
   ```javascript
   var omItem = getCurrentOutputModule();
   if (omItem === null) {
     refreshUI();
     return;
   }
   ```

2. **getPathcontrolForSelection()** - Get initialized pathcontrol
   ```javascript
   var pathcontrol = getPathcontrolForSelection();
   ```

3. **refreshUI()** - Clear and refresh UI
   ```javascript
   refreshUI(); // Instead of cls.prototype.clear() + refreshButton_onClick()
   ```

### Constants Usage

Always use constants instead of magic numbers:

```javascript
// ✅ Correct
rqItem.setSetting('Time Span', TIME_SPAN_COMP_LENGTH);
rqItem.setSetting('Quality', QUALITY_BEST);

// ❌ Wrong
rqItem.setSetting('Time Span', 0);
rqItem.setSetting('Quality', 2);
```

## Module Dependencies

```
constants.jsx (no dependencies)
  ↓
polyfills.jsx (no dependencies)
  ↓
stringutils.jsx → constants.jsx
  ↓
arrayutils.jsx (no dependencies)
  ↓
formatutils.jsx → constants.jsx
  ↓
errorhandler.jsx → constants.jsx, stringutils.jsx
  ↓
platform.jsx (no dependencies)
  ↓
platformsingleton.jsx → platform.jsx
  ↓
common.jsx → stringutils.jsx, constants.jsx
  ↓
[All other modules] → utility modules + platform
```

## ExtendScript Constraints

1. **Global Namespace:** All functions and variables are global
2. **No Module System:** Must use @include directives
3. **Load Order Matters:** Dependencies must be loaded first
4. **No ES6 Features:** Use ES3/ES5 syntax only
5. **Limited Standard Library:** Need polyfills for JSON, Array methods

## Testing Checklist

Before deploying changes:

1. ✅ Panel loads without errors in After Effects
2. ✅ All button functions work correctly
3. ✅ Render queue operations function properly
4. ✅ Version control features work
5. ✅ FFmpeg integration works
6. ✅ Cross-platform compatibility (Windows and macOS)
7. ✅ No console errors in ExtendScript Toolkit

## Common Pitfalls

1. **Creating multiple Platform instances** - Always use `getPlatform()`
2. **Forgetting to update main.jsx @include order** - New modules must be added
3. **Using ES6 syntax** - ExtendScript only supports ES3/ES5
4. **Incorrect load order** - Dependencies must load before dependents
5. **Not testing on both platforms** - Windows and Mac have different behaviors

## Future Enhancements

See REFACTORING_SUMMARY.md for:
- Performance optimization opportunities
- Further modularization possibilities
- Testing framework integration
- Automated build process
