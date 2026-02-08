const Main = imports.ui.main;
const GLib = imports.gi.GLib;
const Settings = imports.ui.settings;
const Events = require("./events");
const DEBUG = require("./debugging");
//----------------------- CONSTANTS
const EVENT_GAP = 50;
const UUID = "tileRice@AdvaitaSoni";

//---------------------------GLOBAL OBJECTS
let eventMgr;

// @add any new keyNames here
const MAP = {
    arrangeKeyBinding: {
        id: "key1",
        kind: "binding",
        event: () => {
            try {
                global.log("hello from event1");
                global.log("eventmgr is null", !eventMgr);
                eventMgr.event1();
            } catch (e) {
                global.log("error in event for key 1", e.message);
            }
            // eventMgr.eventResizeWindow();
        },
    },
    focusKeyBinding: {
        id: "key2",
        kind: "binding",
        event: () => {
            global.log("hello from event2");
            eventMgr.event2();
        },
    },
    swapKeyBinding: {
        id: "key3",
        kind: "binding",
        event: () => {
            eventMgr.event3();
        },
    },
    moveKeyBinding: {
        id: "key3",
        kind: "binding",
        event: () => {
            eventMgr.event4();
        },
    },
    minimizeBinding: {
        id: "minimizeBinding",
        kind: "binding",
        // type: "keybinding",
        event: () => {
            try {
                global.log("Event::minimize");
                eventMgr.event1();
            } catch (e) {
                global.log("error in Event::minimize", e.message);
            }
        },
    },
    halfScreenBinding: {
        id: "halfScreenBinding",
        kind: "binding",
        // type: "keybinding",
        event: () => {
            try {
                global.log("Event::halfScreen");
                eventMgr.event1();
            } catch (e) {
                global.log("error in Event::halfScreen", e.message);
            }
        },
    },
    fullScreenBinding: {
        id: "fullScreenBinding",
        kind: "binding",
        // type: "keybinding",
        event: () => {
            try {
                global.log("Event::fullScreen");
                eventMgr.event1();
            } catch (e) {
                global.log("error in Event::fullScreen", e.message);
            }
        },
    },
    animationsAllowed: {
        kind: "checkbox"
    },
    animationTime: {
        kind: "slider"
    },
    animationType: {
        kind: "combobox"
    }
};

class KeyHandler {
    keyMap;
    settingsMap;
    constructor() {
        eventMgr = Events.EventManager.instance; //assign to global object
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
                key,
                key,
                () => this.updateKeybinding(key),
                null,
            );
        }
        this.updateAllKeyBindings();
    }

    updateEvent(key, eventCallback) {
        if (!this.keyMap[key]) {
            DEBUG.print(
                ` ${UUID} : FAILED TO UPDATE EVENT : Error in key map - value is `,
                this.keyMap,
            );
            return;
        }
        this.keyMap[key].event = eventCallback;
        this.updateKeybinding(key);
    }
    updateKeybinding(key) {
        if (
            this.settingsMap[key] &&
            this.keyMap[key] &&
            this.settingsMap[key].length > 0 &&
            this.keyMap[key].kind == "binding"
        ) {
            try {
                this.destroyKey(key)
            } catch (e) {
                global.log('no prior key')
            }
            Main.keybindingManager.addHotKey(
                this.keyMap[key].id,
                this.settingsMap[key],
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
            DEBUG.Print(
                ` ${UUID} : FAILED TO DESTORY KEYHANLDER : Error in key map : KEY=${key} NOT FOUND!!! - value is `,
                this.keyMap,
            );
        }
        Main.keybindingManager.removeHotKey(this.keyMap[key].id);
    }
    destroy() {
        for (const [key, _] of Object.entries(this.keyMap)) {
            this.destroyKey(key);
        }
        eventMgr.destroy()
        eventMgr = null
    }
}