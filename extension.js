const Settings = imports.ui.settings;
const Main = imports.ui.main;
const GLib = imports.gi.GLib;

//----------------------- CONSTANTS
const UUID = "tileRice@AdvaitaSoni";
const MAP = {
    key1: {
        id: "key1",
        event: event1,
    },
    key2: {
        id: "key2",
        event: event2,
    },
    key3: {
        id: "key3",
        event: event3
    }
};
const EVENT_GAP = 50;

//------------------------ GLOBAL OBJECTS
let extension;

//------------------------------- UTILITY FUNCTIONS

//@for debugging purposes
function print(str, object) {
    global.log(str, JSON.stringify(object));
}

//------------------------- EVENTS
function event1() {
    global.log("this is event1");
}

function event2() {
    global.log("this is event2");
}

function event3() {
    global.log("this is event3")
}
//------------------------- CLASSES
class KeyHandler {
    keyMap; // @add any new keyNames here
    settingsMap;
    constructor() {
        //loads the keyMap from settings
        this.keyMap = MAP; //has keys to event mapping
        this.settingsMap = {};
        for (const [key, _] of Object.entries(MAP)) {
            this.settingsMap[key] = null;
        }

        this.settings = new Settings.ExtensionSettings(this.settingsMap, UUID);
        for (const [key, _] of Object.entries(this.settingsMap)) {
            this.settings.bindProperty(
                Settings.BindingDirection.IN,
                key, key,
                () => this.updateKeybinding(key), null,
            );
        }
        this.updateAllKeyBindings();
    }

    updateEvent(key, eventCallback) {
        if (!this.keyMap[key]) {
            print(` ${UUID} : FAILED TO UPDATE EVENT : Error in key map - value is `, this.keyMap);
            return;
        }
        this.keyMap[key].event = eventCallback;
        this.updateKeybinding(key);
    }
    updateKeybinding(key) {
        if (this.settingsMap[key] && this.keyMap[key] && this.settingsMap[key].length > 0) {
            Main.keybindingManager.addHotKey(
                this.keyMap[key].id, this.settingsMap[key],
                () => {
                    GLib.timeout_add(GLib.PRIORITY_DEFAULT, EVENT_GAP, () => {
                        this.keyMap[key].event();
                        return GLib.SOURCE_REMOVE;
                    });
                },
            );
        }
    }

    updateAllKeyBindings() {
        for (const [key, _] of Object.entries(this.settingsMap)) {
            this.updateKeybinding(key);
        }
    }
    destroyKey(key) {
        if (!this.keyMap[key]) {
            Print(` ${UUID} : FAILED TO DESTORY KEYHANLDER : Error in key map : KEY=${key} NOT FOUND!!! - value is `, this.keyMap, );
        }
        Main.keybindingManager.removeHotKey(this.keyMap[key].id);
    }
    destroy() {
        for (const [key, _] of Object.entries(this.keyMap)) {
            this.destroyKey(key);
        }
    }
}
class myExtension {
    constructor(desc) {
        this.description = desc;
        this.keyHandler = new KeyHandler();
    }
    destroy() {
        this.keyHandler.destroy();
    }
}

// -------------------------------SETUP FUNCTIONS
function init(metadata) {
    extension = new myExtension(metadata)
}

function enable() {
    if (!extension) extension = new myExtension(DESCRIPTION)
}

function disable() {
    extension.destroy();
    extension = null;

}