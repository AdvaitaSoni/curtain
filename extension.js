const key = require("./keyhandler");

//------------------------ GLOBAL OBJECTS
let extension;

//------------------------- EXTENSION
class myExtension {
    description
    keyHandler
    constructor(desc) {
        this.description = desc;
        this.keyHandler = new key.KeyHandler();
    }
    destroy() {
        this.keyHandler.destroy();
        this.keyHandler = null;
    }
}

// -------------------------------SETUP FUNCTIONS
function init(metadata) {
    extension = new myExtension(metadata);
}

function enable() {
    if (!extension) extension = new myExtension(DESCRIPTION);
}

function disable() {
    extension.destroy();
    extension = null;
}