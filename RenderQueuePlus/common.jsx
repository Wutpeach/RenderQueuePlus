/*
MIT License

Copyright (c) 2018 Gergely Wootsch
hello@gergely-wootsch.com
http://gergely-wotsch.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/**
 * @module common
 * @description After Effects specific helper functions
 * @dependencies stringutils.jsx, constants.jsx
 */

/**
 * Imports a given footage path to the project.
 * Creates a 'prerenders' folder with 'comp' and 'verion' subfolders
 * where the new footage item is placed.
 * @param  {string} inPath   path to footage file
 * @param  {boolean} sequence whether to import as sequence
 * @param  {string} compName composition name
 * @param  {string} version  version string
 * @param  {number} framerate framerate (currently read-only in AE)
 * @return {FootageItem}     imported footage item
 */
function importFootage(inPath, sequence, compName, version, framerate) {
  /**
   * private convenience function to import a footage item
   * @param  {string} inPath path to file
   * @return {FootageItem}   imported footage item
   */
  function importFile(inPath) {
    var IO = new ImportOptions();
    IO.file = new File(inPath);
    IO.sequence = sequence;
    if (IO.canImportAs(ImportAsType.FOOTAGE)) {
      IO.importAs = ImportAsType.FOOTAGE;
    }
    return app.project.importFile(IO);
  }

  var footageItem = importFile(inPath);
  // footageItem.mainSource.nativeFrameRate = framerate; // READ ONLY.

  var folderItem;

  var rExists = false;
  var cExists = false;
  var vExists = false;
  var r;
  var c;
  var v;

  var i = 1;

  app.beginUndoGroup('Import footage');

  for (i = 1; i <= app.project.rootFolder.items.length; i++) {
    folderItem = app.project.rootFolder.item(i);
    if (
      (folderItem instanceof FolderItem) &&
      (folderItem.name === 'prerenders')
    ) {
      rExists = true;
      r = folderItem;
      break;
    }
  }

  if (!rExists) {
    r = app.project.items.addFolder('prerenders');
    r.parentFolder = app.project.rootFolder;
  }

  for (i = 1; i <= r.items.length; i++) {
    if (fileNameSafeString(r.item(i).name) === fileNameSafeString(compName)) {
      cExists = true;
      c = r.item(i);
      break;
    }
  }

  if (!cExists) {
    c = app.project.items.addFolder(compName);
    c.parentFolder = r;
  }

  for (i = 1; i <= c.items.length; i++) {
    if (c.item(i).name === version) {
      vExists = true;
      v = c.item(i);
      break;
    }
  }

  if (!vExists) {
    v = app.project.items.addFolder(version);
    v.parentFolder = c;
  }

  for (i = 1; i <= v.items.length; i++) {
    if (v.item(i).name === footageItem.name) {
      Window.alert(
        'Footage already exists in the project.',
        SCRIPT_NAME
      );

      footageItem.remove();
      footageItem = v.item(i);
      v.item(i).mainSource.reload();

      break;
    }
  }

  footageItem.parentFolder = v;
  app.endUndoGroup();

  return footageItem;
}

/**
 * Reveals the folder if exists, or it's parent.
 * @param  {File} p the file or folder object to reveal
 */
function reveal(p) {
  if (p.exists) {
    p.execute();
  } else {
    reveal(p.parent);
  }
}

/**
 * Opens the given website in a browser.
 * @param  {string} url the url to visit
 */
function openLink(url) {
  var linkJumper = new File(TEMP_DIR.absoluteURI + '/renderQueuePlus_linkJumper.html');
  linkJumper.open('w');
  var linkBody = '<html><head><META HTTP-EQUIV=Refresh CONTENT="0; URL=' + url + '"></head><body><p></body></html>';
  linkJumper.write(linkBody);
  linkJumper.close();
  linkJumper.execute();
}

/**
 * Sets the default renderQueue item properties.
 * As of CC 2018 the output module properties are
 * still read-only. Come on Adobe...
 * @param {integer} rqIndex Render Queue item index (1-based).
 * @param {integer} omIndex Render Queue OutputModule index (1-based).
 * @param {object} pathcontrol Pathcontrol instance.
 */
function setRenderQueueItemDefaults(rqIndex, omIndex, pathcontrol) {
  var rqItem = app.project.renderQueue.item(rqIndex);
  var omItem = data.getOutputModule(rqIndex, omIndex);

  rqItem.setSetting('Time Span', TIME_SPAN_COMP_LENGTH);
  if (pathcontrol.getPadding() === 0) {
    rqItem.setSetting('Skip Existing Files', false);
  } else {
    rqItem.setSetting('Skip Existing Files', true);
  }

  /**
   * Overrides output module settings.
   * TODO: This perhaps needs exposing.
   * Keeping it unexposed for the time being.
   */
  function setDefaults() {
    rqItem.setSetting('Quality', QUALITY_BEST);
    rqItem.setSetting('Resolution', RESOLUTION_FULL);
    omItem.setSetting('Video Output', true);
    omItem.setSetting('Use Comp Frame Number', false);
    omItem.setSetting('Starting #', STARTING_FRAME_NUMBER);
    omItem.setSetting('Resize', false);
  }

  // TODO: get Adobe to make these variables scriptable.
  // omItem.setSetting('Format', 7); // 'PNG' - READ ONLY PROPERTY
  // omItem.setSetting('Channels', 1); // 'RGBA' - READ ONLY PROPERTY
  // omItem.setSetting('Depth', 32); // 'Millions+' - READ ONLY PROPERTY
  // omItem.setSetting('Color', 0); // 'Straight' - READ ONLY PROPERTY
}

/**
 * Checks if an object is empty
 * @param  {object}  o the object to check
 * @return {Boolean}   true if empty, false otherwise
 */
function isObjectEmpty(o) {
  var key;
  for (key in o) {
    return false;
  }
  return true;
}

/**
 * Returns a count of output modules
 * @return {number} number of output modules
 */
function numOutputModules() {
  var i = 1;
  var j = 1;
  var k = 0;
  for (i = 1; i <= app.project.renderQueue.numItems; i++) {
    for (j = 1; j <= app.project.renderQueue.item(i).numOutputModules; j++) {
      ++k;
    }
  }
  return k;
}

/**
 * Runs checks before executing aerender
 * @param {Number} rqIndex Render Queue item index
 * @return {Boolean} true if ok to start, false otherwise
 */
function aerenderOkToStart(rqIndex) {
  var err = 'After Effects warning: \'Skip Existing Files\' is available only with ONE output module of type \'Sequence\'.';
  if (app.project.renderQueue.item(rqIndex).numOutputModules > 1) {
    if (app.project.renderQueue.item(rqIndex).getSetting('Skip Existing Files')) {
      return false;
    } else {
      return true;
    }
  } else {
    return true;
  }
  return true;
}
