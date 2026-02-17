# RenderQueuePlus Coding Conventions

## File Naming

- Use lowercase with no spaces: `mainwindow.jsx`, `platformsingleton.jsx`
- Use descriptive names: `errorhandler.jsx` not `errors.jsx`
- Suffix with `.jsx` for ExtendScript files

## Module Structure

Every module should have:

1. **License header** (MIT License)
2. **JSDoc module comment** with:
   - `@module` - Module name
   - `@description` - What the module does
   - `@dependencies` - What it depends on

```javascript
/**
 * @module modulename
 * @description Brief description of what this module does
 * @dependencies dependency1.jsx, dependency2.jsx
 */
```

## Function Documentation

Use JSDoc comments for all public functions:

```javascript
/**
 * Brief description of what the function does
 * @param  {Type} paramName Description of parameter
 * @return {Type}           Description of return value
 */
function functionName(paramName) {
  // implementation
}
```

## Naming Conventions

### Functions
- Use camelCase: `getCurrentOutputModule()`
- Use descriptive names: `getPathcontrolForSelection()` not `getPC()`
- Event handlers: `buttonName_onClick()`

### Variables
- Use camelCase: `omItem`, `pathcontrol`
- Use descriptive names: `scriptFile` not `sf`
- Constants: Use UPPER_SNAKE_CASE: `TIME_SPAN_COMP_LENGTH`

### Classes
- Use PascalCase: `Platform`, `MainWindow`
- Constructor functions: `var cls = function() { ... }`

## Code Style

### Indentation
- Use 2 spaces (not tabs)
- Consistent indentation throughout

### Braces
- Opening brace on same line
- Closing brace on new line

```javascript
if (condition) {
  // code
} else {
  // code
}
```

### Semicolons
- Use semicolons consistently
- End statements with semicolons

### String Quotes
- Use single quotes for strings: `'string'`
- Use double quotes for shell commands and paths

## Platform-Specific Code

Always use the Platform singleton:

```javascript
var platform = getPlatform();

if (platform.isWindows) {
  // Windows-specific code
} else {
  // Mac-specific code
}
```

### Shell Commands

For Windows:
```javascript
var cmd = 'start "" "' + path + '"';
```

For Mac:
```javascript
var cmd = 'open "' + path + '"';
// Set encoding for shell scripts
scriptFile.encoding = 'UTF-8';
scriptFile.lineFeed = 'Unix';
```

## Error Handling

Use try-catch with custom error handler:

```javascript
try {
  // risky operation
} catch (e) {
  catchError(e);
}
```

For button click handlers:
```javascript
button.onClick = function() {
  try {
    buttonName_onClick();
  } catch (e) {
    catchError(e);
  }
};
```

## Constants

Define all magic numbers and strings as constants:

```javascript
// ✅ Good
var PADDING_5_DIGITS = 5;
var DEFAULT_ELLIPSIS_LENGTH = 100;

// ❌ Bad
if (padding === 5) { ... }
if (length > 100) { ... }
```

## Helper Functions

Extract repeated patterns into helper functions:

```javascript
// ✅ Good - use helper
var omItem = getCurrentOutputModule();
if (omItem === null) {
  refreshUI();
  return;
}

// ❌ Bad - duplicate code
var omItem = data.getOutputModule(
  data.item(listItem.selection.index).rqIndex,
  data.item(listItem.selection.index).omIndex
);
if (omItem === null) {
  cls.prototype.clear();
  refreshButton_onClick();
  return;
}
```

## File Operations

### Reading Files
```javascript
var file = new File(path);
if (file.exists) {
  file.open('r');
  var content = file.read();
  file.close();
}
```

### Writing Files
```javascript
var file = new File(path);
file.open('w');
file.write(content);
file.close();
```

### Mac-Specific File Writing
```javascript
// For shell scripts on Mac
scriptFile.encoding = 'UTF-8';
scriptFile.lineFeed = 'Unix';
scriptFile.open('w');
scriptFile.write(content);
scriptFile.close();
```

## UI Patterns

### Button Creation
```javascript
var button = group.add('iconbutton', undefined, ICON_FILES.iconName, {
  name: 'buttonName',
  style: 'toolbutton',
  toggle: false,
});
button.onClick = function() {
  try {
    buttonName_onClick();
  } catch (e) {
    catchError(e);
  }
};
button.size = [width, height];
button.helpTip = 'Description of what button does';
```

### Selection Validation
```javascript
if (!(listItem.selection)) {
  return;
}
```

## Debugging

Use ExtendScript's writeln for debugging:

```javascript
$.writeln('RenderQueue+: Debug message');
```

Never use `alert()` for debugging - it blocks execution.

## Performance

### Avoid Repeated Instantiation
```javascript
// ✅ Good - singleton
var platform = getPlatform();

// ❌ Bad - creates new instance
var platform = new Platform();
```

### Cache Expensive Operations
```javascript
// ✅ Good - cache result
var omItem = getCurrentOutputModule();
if (omItem === null) return;
// use omItem multiple times

// ❌ Bad - repeated calls
if (data.getOutputModule(...) === null) return;
var name = data.getOutputModule(...).name;
```

## Security

### Path Sanitization
Always sanitize user input for shell commands:

```javascript
var cleanName = name
  .replace(/[\[\]\s\(\)\&\|\;\<\>\$\`\"\'\\]/g, '_')
  .replace(/_+/g, '_');
```

### File Path Quoting
Always quote file paths in shell commands:

```javascript
// ✅ Good
var cmd = '"' + path + '"';

// ❌ Bad - breaks with spaces
var cmd = path;
```

## Testing Checklist

Before committing code:

1. ✅ Test on Windows
2. ✅ Test on macOS
3. ✅ Test with spaces in paths
4. ✅ Test with special characters in names
5. ✅ Test error conditions
6. ✅ Check ExtendScript Toolkit console for errors
7. ✅ Verify no global variable pollution

## Common Mistakes to Avoid

1. **Using `new Platform()` instead of `getPlatform()`**
2. **Forgetting platform-specific line endings for shell scripts**
3. **Not quoting file paths in shell commands**
4. **Using ES6 syntax (arrow functions, const/let, template literals)**
5. **Not handling null/undefined checks**
6. **Forgetting to close files after opening**
7. **Using alert() instead of Window.alert() or alertScroll()**
8. **Not testing on both Windows and Mac**

## Code Review Checklist

- [ ] JSDoc comments for all public functions
- [ ] Module header with @module, @description, @dependencies
- [ ] Uses `getPlatform()` instead of `new Platform()`
- [ ] Uses helper functions instead of duplicating code
- [ ] Uses constants instead of magic numbers
- [ ] Platform-specific code properly branched
- [ ] File paths properly quoted in shell commands
- [ ] Error handling with try-catch
- [ ] No ES6 syntax
- [ ] Tested on both Windows and Mac
