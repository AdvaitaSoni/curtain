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
        id: "arrangKeyBinding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::arrangeKeyBinding");
                eventMgr.arrange();
            } catch (e) {
                global.log("error in Event::arrangeKeyBinding", e.message);
            }
        },
    },
    focusKeyBinding: {
        id: "focusKeyBinding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::focusKeyBinding");
                eventMgr.focusToNextAlgorithmically();
            } catch (e) {
                global.log("error in Event::focusKeyBinding", e.message);
            }
            // eventMgr.eventResizeWindow();
        },
    },
    swapKeyBinding: {
        id: "swapKeyBinding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::swapKeyBinding");
                eventMgr.swapToNextAlgorithmically();
            } catch (e) {
                global.log("error in Event::swapKeyBinding", e.message);
            }
            // eventMgr.eventResizeWindow();
        },
    },
    moveKeyBinding: {
        id: "moveKeyBinding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::moveKeyBinding");
                eventMgr.moveInDirectionOfNextNode();
            } catch (e) {
                global.log("error in Event::moveKeyBinding", e.message);
            }
            // eventMgr.eventResizeWindow();
        },
    },
    halfScreenBinding: {
        id: "halfScreenBinding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::halfScreen");
                eventMgr.halfMaximize();
            } catch (e) {
                global.log("error in Event::halfScreen", e.message);
            }
        },
    },
    fullScreenBinding: {
        id: "fullScreenBinding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::fullScreen");
                eventMgr.fullMaximize();
            } catch (e) {
                global.log("error in Event::fullScreen", e.message);
            }
        },
    },
    unmaximizeBinding: {
        id: "unmaximizeBinding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::unmaximizeBinding");
                eventMgr.unmaximize();
            } catch (e) {
                global.log("error in Event::unmaximizeBinding", e.message);
            }
        },
    },
    minimizeBinding: {
        id: "minimizeBinding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::minimizeBinding");
                eventMgr.minimize();
            } catch (e) {
                global.log("error in Event::minimizeBinding", e.message);
            }
        },
    },
    moveSwitchWorkspace1Binding: {
        id: "moveSwitchWorkspace1Binding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::moveSwitchWorkspace1Binding");
                eventMgr.moveSwitchWorkspace1Binding()
            } catch (e) {
                global.log("error in Event::moveSwitchWorkspace1Binding", e.message);
            }
        },
    },
    moveSwitchWorkspace2Binding: {
        id: "moveSwitchWorkspace2Binding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::moveSwitchWorkspace2Binding");
                eventMgr.moveSwitchWorkspace2Binding()
            } catch (e) {
                global.log("error in Event::moveSwitchWorkspace2Binding", e.message);
            }
        },
    },

    //todo: add a note for switching to next workspace setting
    //todo: add a note for kill binding alt+f4
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

        let settings = new Settings.ExtensionSettings(this.settingsMap, UUID);
        for (const [key, _] of Object.entries(this.settingsMap)) {
            settings.bindProperty(
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
        this.keyMap = null
        this.settingsMap = null
    }
}