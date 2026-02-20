const key = require("./keyhandler");
const Util = imports.misc.util;
const { getEnabled, setEnableChangedCallback } = require("./keyMap")

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
        global.log("creating a new extension")
        extension = new myExtension();
    } catch (e) {
        global.log("error in init function ", e.message);
    }
}

function enable() {
    try {
        global.log("creating a new extension")
        if (!extension) extension = new myExtension();
    } catch (e) {
        global.log("error in enable function ", e.message);
    }
    return Callbacks
}

function disable() {
    try {
        extension.destroy();
        extension = null;
    } catch (e) {
        global.log("error in disable function ", e.message);
    }
}

const Callbacks = {
    custom_shortcuts: function() {
        Util.spawnCommandLineAsync("cinnamon-settings keyboard -t shortcuts");
    }
}
