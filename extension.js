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
            global.log("keys printing are ", key, " and type = ", typeof key);
            global.log("keymap is ", this.keyMap);
            global.log("keymap entry is ", this.keyMap[key]);
            global.log(
                "arg1 : ",
                this.keyMap[key].id,
                " & arg2 : ",
                this.settingsMap[key],
            );
            Main.keybindingManager.addHotKey(
                this.keyMap[key].id,
                this.settingsMap[key],
                () => {
                    GLib.timeout_add(GLib.PRIORITY_DEFAULT, EVENT_GAP, () => {
                        global.log("keybinding done"); //!!TESTING
                        this.keyMap[key].event();
                        return GLib.SOURCE_REMOVE;
                    });
                },
            );
        }
    }

    updateAllKeyBindings() {
        global.log("called all update method");
        for (const [key, _] of Object.entries(this.settingsMap)) {
            this.updateKeybinding(key);
        }
    }
    destroyKey(key) {
        if (!this.keyMap[key])
            Print(
                ` ${UUID} : FAILED TO DESTORY KEYHANLDER : Error in key map : KEY=${key} NOT FOUND!!! - value is `,
                this.keyMap,
            );
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
        //loads the keyMap from Settings
        this.keyHandler = new KeyHandler();
    }
    destroy() {
        this.keyHandler.destroy();
    }
}

// function setKeybinding() {
//     if (
//         extension.settings_config.keyMap.mykey &&
//         extension.settings_config.keyMap.mykey.length > 0
//     )
//         print("value of mykey was ", extension.settings_config.keyMap.mykey)
//     Main.keybindingManager.addHotKey(
//         keyid,
//         extension.settings_config.keyMap.mykey,
//         () => {
//             GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => {
//                 print("hey did you press windows key? ", null);
//                 return GLib.SOURCE_REMOVE;
//             });
//         },
//     );
// }

// -------------------------------SETUP FUNCTIONS
function init() {
    global.log();
}

function enable() {
    extension = new myExtension("hello");
    // extension.settingsObj = new Settings.ExtensionSettings(
    //     extension.settings_config.keyMap,
    //     UUID,
    // );
    // extension.settingsObj.bindProperty(
    //     Settings.BindingDirection.IN,
    //     key,
    //     key,
    //     setKeybinding,
    //     null,
    // );
    // print("settingsObject is ", extension.settingsObj);
    // setKeybinding();
    //!! TESTING CODE
    //   setTimeout(() => {
    //     global.log("This message appears after 2 seconds");
    //   }, 2000);
    //   global.log("This runs immediately");

    // _grabId = global.display.connect(
    //     "grab-op-begin",
    //     (display, screen, window, op) => {
    //         global.log("hey you are grabbing now");
    //         global.log("display is ", JSON.stringify(display));
    //         print("window is ", window);
    //         print("screen is ", screen);
    //         print("op is", op);
    //         print("display is same? ", global.display == display);
    //         print("screen is same? ", global.screen == screen);
    //     },
    // );
    // _ungrabId = global.display.connect("grab-op-end", () =>
    //     global.log("you are now NOT grabbing"),
    // );
    // global.log("display OBject is ", global.display);
    // global.log("this is printed when the extension is enabled");
    //!! TESTING ENDS
}

function disable() {
    extension.destroy();
    extension = null;
    // global.display.disconnect(_grabId);
    // global.display.disconnect(_ungrabId);
    // global.log("this is printed when the extension is disabled");
}

function init() {}