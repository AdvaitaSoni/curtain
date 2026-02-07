const key = require("./keyhandler");

//------------------------ GLOBAL OBJECTS
let extension;

//------------------------- EXTENSION
class myExtension {
  keyHandler;
  constructor() {
    this.keyHandler = new key.KeyHandler();
  }
  destroy() {
    this.keyHandler.destroy();
    this.keyHandler = null;
  }
}

// -------------------------------SETUP FUNCTIONS
function init(metadata) {
  try {
    extension = new myExtension();
  } catch (e) {
    global.log("error in init function ", e.message);
  }
}

function enable() {
  try {
    if (!extension) extension = new myExtension();
  } catch (e) {
    global.log("error in enable function ", e.message);
  }
}

function disable() {
  try {
    extension.destroy();
    extension = null;
  } catch (e) {
    global.log("error in disable function ", e.message);
  }
}
