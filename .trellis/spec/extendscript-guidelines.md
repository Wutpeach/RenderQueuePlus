# ExtendScript Development Guidelines

## Overview

This document captures conventions and patterns for developing ExtendScript code for Adobe After Effects.

## Multiselect Handling Pattern

### Problem
When enabling multiselect on a listbox, `listItem.selection` behavior changes:
- Single select: `listItem.selection` is an object with `.index` property
- Multi select: `listItem.selection` is an array of objects

### Solution Pattern

Always use helper functions to safely access selection:

```javascript
/**
 * Helper function to get first selected index
 * @return {number|null} Index of first selected item or null
 */
function getFirstSelectedIndex() {
  if (!(listItem.selection)) {
    return null;
  }
  var selection = listItem.selection;
  if (selection.length !== undefined && selection.length > 0) {
    return selection[0].index;
  }
  return selection.index;
}
```

**Usage**:
```javascript
// BAD - breaks with multiselect
var index = listItem.selection.index;

// GOOD - works with both single and multi select
var index = getFirstSelectedIndex();
```

## Path Normalization

### Problem
ExtendScript's `File.fsName` can return paths with `/Volumes/Macintosh HD/` prefix on macOS, which causes issues in command-line execution.

### Solution

Always normalize paths before using in shell commands:

```javascript
/**
 * Helper function to normalize file path
 * Removes /Volumes/Macintosh HD/ prefix if present
 * @param {string} path File path
 * @return {string} Normalized path
 */
function normalizePath(path) {
  if (!path) return path;
  if (path.indexOf('/Volumes/Macintosh HD/') === 0) {
    return path.replace('/Volumes/Macintosh HD/', '/');
  }
  return path;
}
```

**Usage**:
```javascript
var omItem = getCurrentOutputModule();
var outputPath = normalizePath(omItem.file.fsName);
// Use outputPath in shell commands
```

## Background Process Execution

### Problem
- `scriptFile.execute()` triggers macOS permission dialogs
- `system.callSystem()` with background execution (`&`) may not reliably start processes
- `system.callSystem()` can cause hangs on Mac with AE 2025

### Solution

Use `nohup` with `scriptFile.execute()`:

```javascript
// Create script with nohup
scriptContent = '#!/bin/bash\n' +
  '# Rendering ' + compName + '\n' +
  'nohup ' + cmd + ' > /tmp/aerender_' + compName + '.log 2>&1 &\n' +
  'echo "Render started with PID: $!"\n';

scriptFile.encoding = 'UTF-8';
scriptFile.lineFeed = 'Unix';
scriptFile.open('w');
scriptFile.write(scriptContent);
scriptFile.close();

// Set execute permissions
platform.setExecutePermissions(scriptFile);

// Execute - will show permission dialog once per session
scriptFile.execute();
```

**Benefits**:
- Process continues even if terminal closes
- Output logged to file for debugging
- More reliable than `system.callSystem()` with `&`

**Trade-off**: User must allow terminal permission once per session

## UI Layout Constraints

### Problem
ScriptUI groups with `orientation: 'row'` can overflow when window is resized, hiding buttons.

### Solution

Set minimum size constraints:

```javascript
var controlsGroup = palette.add('group');
controlsGroup.alignment = ['fill', 'top'];
controlsGroup.orientation = 'row';
controlsGroup.minimumSize = [800, 30];  // Minimum width to fit all buttons

// In resize handler
palette.onResizing = palette.onResize = function() {
  var minWidth = 800;
  if (palette.size.width < minWidth) {
    palette.size.width = minWidth;
  }
  // ... rest of resize logic
};
```

## Batch Operations Pattern

### Pattern for Processing Multiple Items

```javascript
function processItems(batchMode) {
  var selectedItems = [];

  if (batchMode) {
    // Collect all selected items
    for (var i = 0; i < listItem.items.length; i++) {
      if (listItem.items[i].selected) {
        selectedItems.push(i);
      }
    }
  } else {
    // Single mode - use first selected
    var firstIndex = getFirstSelectedIndex();
    if (firstIndex !== null) {
      selectedItems.push(firstIndex);
    }
  }

  // Process each item
  for (var itemIdx = 0; itemIdx < selectedItems.length; itemIdx++) {
    var index = selectedItems[itemIdx];
    // ... process item
  }
}
```

## Common Mistakes

### 1. Direct Selection Access
❌ `var index = listItem.selection.index;`
✅ `var index = getFirstSelectedIndex();`

### 2. Using Raw File Paths
❌ `cmd = 'aerender -output "' + omItem.file.fsName + '"';`
✅ `cmd = 'aerender -output "' + normalizePath(omItem.file.fsName) + '"';`

### 3. Background Execution Without nohup
❌ `scriptContent = cmd + ' &\n';`
✅ `scriptContent = 'nohup ' + cmd + ' > /tmp/log.txt 2>&1 &\n';`

### 4. No Minimum Window Size
❌ No size constraints → buttons get hidden
✅ Set `minimumSize` and enforce in resize handler

## Debugging

### Enable Debug Alerts

Uncomment debug code in `aerender()` function:

```javascript
// Debug info collection (disabled by default, uncomment to enable)
var debugInfo = 'Debug Information:\n\n';
debugInfo += 'Selected items: ' + selectedItems.length + '\n';
// ... more debug info

// At end of function
Window.alert(debugInfo, 'Render Debug Info');
```

### Check Render Logs

```bash
# View render progress
tail -f /tmp/aerender_<compname>.log

# Check if aerender is running
ps aux | grep aerender
```

## Testing Checklist

- [ ] Single item selection works
- [ ] Multiple item selection works (Cmd+Click)
- [ ] Single render button works
- [ ] Batch render button works
- [ ] Window can be resized without hiding buttons
- [ ] Render process starts successfully
- [ ] Output files are created in correct location
