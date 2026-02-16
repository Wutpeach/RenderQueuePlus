# RenderQueue+: A handy After Effects workflow utility for rendering, reviewing, and managing render outputs.


RenderQueue+ adds ***output versioning, background rendering, relative output paths, image-sequence review and editing*** utilities to your After Effects toolset. And more!

The panel loosely integrates with ***Shotgun's RV*** that can be used for reviewing your output. Using FFmpeg, it automatically generates movies from your sequence outputs giving you a wider gamut to interact and review your rendered image-sequences.

## Platform Support

✅ **Windows** - Fully supported
✅ **Mac OS** - Fully supported (as of 2026)

## Limitations

* The versioning pattern is hard-coded and there's no way to customize as things stand. I hope to add custom templates in the future
* FFmpeg output could do with presets
* Panel has been tested but bugs are possible


## Installation

### Windows

Place **both** the **RenderQueue+.jsx** file _**and**_ the **RenderQueuePlus** folder into After Effect's **ScriptUI Panels** folder.

```
ScriptUI Panels\RenderQueue+.jsxb
ScriptUI Panels\RenderQueuePlus\
```

It's located usually here (replace [Your Version] with the After Effects version you have):

```
C:\Program Files\Adobe\Adobe After Effects [Your Version]\Support Files\Scripts\ScriptUI Panels
```

After restarting After Effects you should see a 'RenderQueue+.jsx' menu-item at the bottom of the 'Window' menu.

### Mac OS

Place **both** the **RenderQueue+.jsx** file _**and**_ the **RenderQueuePlus** folder into After Effect's **ScriptUI Panels** folder.

```
ScriptUI Panels/RenderQueue+.jsxb
ScriptUI Panels/RenderQueuePlus/
```

It's located usually here (replace [Your Version] with the After Effects version you have):

```
/Applications/Adobe After Effects [Your Version]/Scripts/ScriptUI Panels
```

After restarting After Effects you should see a 'RenderQueue+.jsx' menu-item at the bottom of the 'Window' menu.

#### Mac-Specific Setup

On first run, you may need to manually locate the `aerender` executable. It's located inside the After Effects application bundle:

```
/Applications/Adobe After Effects [Version]/Adobe After Effects [Version].app/Contents/MacOS/aerender
```

**Quick way to find it:**
1. Press `Cmd + Shift + G` in the file dialog
2. Paste the path above (adjust version number)
3. Select the `aerender` file

For detailed Mac setup instructions, see [MAC_SETUP_GUIDE.md](MAC_SETUP_GUIDE.md).

#### Optional: FFmpeg (for movie generation)

**Mac users:** Install FFmpeg via Homebrew:
```bash
brew install ffmpeg
```

Then in RenderQueue+ settings, set the FFmpeg path:
- Intel Mac: `/usr/local/bin/ffmpeg`
- Apple Silicon: `/opt/homebrew/bin/ffmpeg`

**Windows users:** Download FFmpeg from [ffmpeg.org](https://ffmpeg.org) and set the path in settings.

## Features

##### Background (and batch rendering)

RenderQueue+ can render output modules in the background so you don't have to stop work to wait for renders to complete.

**Windows:** Creates `.bat` batch files that can be launched across multiple computers on a network.
**Mac:** Creates `.sh` shell scripts for background rendering.

This might sometimes be handy for small studios or individuals where a render-farm solution is not available.


#### Version Control

You can enable versioning for any of your output modules by setting 'Version Control' (from the 'Versions' drop-down menu). You have options to increment and reset the version, and also, to toggle between the existing versions via the drop-down menu. This can be handy when comparing revisions, or generally, to keep things neat and tidy.

#### Relative (and absolute) render paths

RenderQueue+ can set your output paths to be relative to the current project.
For example, let's assume your project files are in the ***comps*** folder, and we want the renders to be placed in the folder called ***renders*** in the same folder as the ***comps*** folder.

```
C:/work/comps/My After Effects Project.aep
C:/work/renders/
```

We can point to the ***renders*** folder by entering the following in Settings:

```
././renders
```

The output path will be set once we select 'Set Version Control' for the item. Simple, albeit arguably somewhat limited in its
current form.


##### RV

If you're a Shotgun/RV user you can call RV from the RenderQueue+ to review your rendered files.


##### Frame Manager

You can delete rendered images (or movies) from the app via the RenderQueue+'s Frame Manager.
Here you can filter your files by sequence patterns, eg. entering in the filter box '1-20, 30-40' will display only frames 1-20 and 30-40. This makes it easy to remove specific image-ranges if you need to re-render only a section of your comp.


##### Restore project used to render the given version

The panel automatically archives a copy of your comp when you start a render: this means, you can always refer back to the project used to render a given version.


## Tips

##### Name your output comp sensibly
The output composition names are automatically picked-up and used in the name of the render files.
Make sure they have sensible names and contain no special characters (or at least bear in mind, these will be removed from the output name).

##### Make sure your output comp starts and ends at the right frames
This might sound strange, but the tool always renders the entirety of your output comp.

Hence, if your comp starts at frame 1, and finishes at frame 350, it will render all the frames between and including 1 and 350.
This is enforced as a matter of principle to keep things, but chiefly, the author of this script organised. It is sometimes nice to have restrictions and it's better to be tidy and to make sure the output comp is set-up correctly.

##### ...But, but...I *have* to render a range

If you delete frames from an existing sequence of images, those frames will automatically be re-rendered (the panel automatically sets sequences to skip existing files when you set Version Control). This allows you to re-render ranges, and specific frames too. RenderQueue+ comes with a frame manager to help you delete image ranges, and/or specific frames straight from After Effects.

## Documentation

- [MAC_SETUP_GUIDE.md](MAC_SETUP_GUIDE.md) - Detailed Mac setup instructions
- [MAC_COMPATIBILITY.md](MAC_COMPATIBILITY.md) - Technical implementation details
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Development overview

## Changelog

### 2026 - Mac Compatibility Update
- ✅ Added full Mac OS support
- ✅ Cross-platform script generation (.bat for Windows, .sh for Mac)
- ✅ Auto-detection of aerender on both platforms
- ✅ Platform-specific process management
- ✅ Cross-platform directory operations
- ✅ FFmpeg integration for both platforms
- ✅ Fixed AE 2025 path detection (aerender location changed)
- ✅ Fixed system.callSystem hang issue on Mac (disabled process checking on Mac)

#### About

**Original Author:**
Copyright (c) 2018 Gergely Wootsch
hello@gergely-wootsch.com
http://gergely-wotsch.com

**Mac Compatibility:**
Added in 2026 - Full cross-platform support for Windows and Mac OS

#### Support and contact

Original project: http://gergely-wootsch.com/renderqueueplus
Email: hello@gergely-wootsch.com

For Mac-specific issues, please refer to [MAC_SETUP_GUIDE.md](MAC_SETUP_GUIDE.md)
