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
                eventMgr.moveSwitchWorkspace1()
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
                eventMgr.moveSwitchWorkspace2()
            } catch (e) {
                global.log("error in Event::moveSwitchWorkspace2Binding", e.message);
            }
        },
    },
    moveSwitchWorkspace3Binding: {
        id: "moveSwitchWorkspace3Binding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::moveSwitchWorkspace3Binding");
                eventMgr.moveSwitchWorkspace3()
            } catch (e) {
                global.log("error in Event::moveSwitchWorkspace3Binding", e.message);
            }
        },
    },
    moveSwitchWorkspace4Binding: {
        id: "moveSwitchWorkspace4Binding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::moveSwitchWorkspace4Binding");
                eventMgr.moveSwitchWorkspace4()
            } catch (e) {
                global.log("error in Event::moveSwitchWorkspace4Binding", e.message);
            }
        },
    },
    moveSwitchWorkspace5Binding: {
        id: "moveSwitchWorkspace5Binding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::moveSwitchWorkspace5Binding");
                eventMgr.moveSwitchWorkspace5()
            } catch (e) {
                global.log("error in Event::moveSwitchWorkspace5Binding", e.message);
            }
        },
    },
    moveSwitchWorkspace6Binding: {
        id: "moveSwitchWorkspace6Binding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::moveSwitchWorkspace6Binding");
                eventMgr.moveSwitchWorkspace6()
            } catch (e) {
                global.log("error in Event::moveSwitchWorkspace6Binding", e.message);
            }
        },
    },
    moveSwitchWorkspace7Binding: {
        id: "moveSwitchWorkspace7Binding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::moveSwitchWorkspace7Binding");
                eventMgr.moveSwitchWorkspace7()
            } catch (e) {
                global.log("error in Event::moveSwitchWorkspace7Binding", e.message);
            }
        },
    },
    moveSwitchWorkspace8Binding: {
        id: "moveSwitchWorkspace8Binding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::moveSwitchWorkspace8Binding");
                eventMgr.moveSwitchWorkspace8()
            } catch (e) {
                global.log("error in Event::moveSwitchWorkspace8Binding", e.message);
            }
        },
    },
    moveSwitchWorkspace9Binding: {
        id: "moveSwitchWorkspace9Binding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::moveSwitchWorkspace9Binding");
                eventMgr.moveSwitchWorkspace9()
            } catch (e) {
                global.log("error in Event::moveSwitchWorkspace9Binding", e.message);
            }
        },
    },
    moveSwitchNextWorkspaceBinding: {
        id: "moveSwitchNextWorkspaceBinding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::moveSwitchNextWorkspaceBinding");
                eventMgr.moveSwitchNextWorkspace()
            } catch (e) {
                global.log("error in Event::moveSwitchNextWorkspaceBinding", e.message);
            }
        },
    },
    moveSwitchPrevWorkspaceBinding: {
        id: "moveSwitchPrevWorkspaceBinding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::moveSwitchPrevWorkspaceBinding");
                eventMgr.moveSwitchPrevWorkspace()
            } catch (e) {
                global.log("error in Event::moveSwitchPrevWorkspaceBinding", e.message);
            }
        },
    },
    switchWorkspace1Binding: {
        id: "switchWorkspace1Binding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::switchWorkspace1Binding");
                eventMgr.switchWorkspace1()
            } catch (e) {
                global.log("error in Event::switchWorkspace1Binding", e.message);
            }
        },
    },
    switchWorkspace2Binding: {
        id: "switchWorkspace2Binding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::switchWorkspace2Binding");
                eventMgr.switchWorkspace2()
            } catch (e) {
                global.log("error in Event::switchWorkspace2Binding", e.message);
            }
        },
    },
    switchWorkspace3Binding: {
        id: "switchWorkspace3Binding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::switchWorkspace3Binding");
                eventMgr.switchWorkspace3()
            } catch (e) {
                global.log("error in Event::switchWorkspace3Binding", e.message);
            }
        },
    },
    switchWorkspace4Binding: {
        id: "switchWorkspace4Binding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::switchWorkspace4Binding");
                eventMgr.switchWorkspace4()
            } catch (e) {
                global.log("error in Event::switchWorkspace4Binding", e.message);
            }
        },
    },
    switchWorkspace5Binding: {
        id: "switchWorkspace5Binding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::switchWorkspace5Binding");
                eventMgr.switchWorkspace5()
            } catch (e) {
                global.log("error in Event::switchWorkspace5Binding", e.message);
            }
        },
    },
    switchWorkspace6Binding: {
        id: "switchWorkspace6Binding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::switchWorkspace6Binding");
                eventMgr.switchWorkspace6()
            } catch (e) {
                global.log("error in Event::switchWorkspace6Binding", e.message);
            }
        },
    },
    switchWorkspace7Binding: {
        id: "switchWorkspace7Binding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::switchWorkspace7Binding");
                eventMgr.switchWorkspace7()
            } catch (e) {
                global.log("error in Event::switchWorkspace7Binding", e.message);
            }
        },
    },
    switchWorkspace8Binding: {
        id: "switchWorkspace8Binding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::switchWorkspace8Binding");
                eventMgr.switchWorkspace8()
            } catch (e) {
                global.log("error in Event::switchWorkspace8Binding", e.message);
            }
        },
    },
    switchWorkspace9Binding: {
        id: "switchWorkspace9Binding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::switchWorkspace9Binding");
                eventMgr.switchWorkspace9()
            } catch (e) {
                global.log("error in Event::switchWorkspace9Binding", e.message);
            }
        },
    },
    switchNextWorkspaceBinding: {
        id: "switchNextWorkspaceBinding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::switchNextWorkspaceBinding");
                eventMgr.switchNextWorkspace()
            } catch (e) {
                global.log("error in Event::switchNextWorkspaceBinding", e.message);
            }
        },
    },
    switchPrevWorkspaceBinding: {
        id: "switchPrevWorkspaceBinding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::switchPrevWorkspaceBinding");
                eventMgr.switchPrevWorkspace()
            } catch (e) {
                global.log("error in Event::switchPrevWorkspaceBinding", e.message);
            }
        },
    },
    killBinding: {
        id: "killBinding",
        kind: "binding",
        event: () => {
            try {
                global.log("Event::killBinding");
                eventMgr.kill()
            } catch (e) {
                global.log("error in Event::killBinding", e.message);
            }
        },
    },
    //todo: add a note for switching to next workspace setting
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