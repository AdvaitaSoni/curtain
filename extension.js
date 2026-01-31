const Settings = imports.ui.settings;
const Main = imports.ui.main;
const GLib = imports.gi.GLib;
const UUID = "tileRice@AdvaitaSoni";
const keyid = "superkeyID";
const key = "mykey";
// let _grabId, _ungrabId;

function init() {
    global.log();
}

function print(str, object) {
    //for debug purposes
    global.log(str, JSON.stringify(object));
}

let extension;

class KeyHandler {
    keyMap
    constructor(map) {
        this.keyMap = map
    };
    addHandler(keybinding, eventCallback) {
        print("hello", "world")
    };
};
class myExtension {
    constructor(desc) {
        this.description = desc;
        this.settings_config = {
            keyMap: {
                mykey: null,
            },
        };
        this.settingsObj = null;
    }
}

function setKeybinding() {
    if (
        extension.settings_config.keyMap.mykey &&
        extension.settings_config.keyMap.mykey.length > 0
    )
        print("value of mykey was ", extension.settings_config.keyMap.mykey)
    Main.keybindingManager.addHotKey(
        keyid,
        extension.settings_config.keyMap.mykey,
        () => {
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => {
                print("hey did you press windows key? ", null);
                return GLib.SOURCE_REMOVE;
            });
        },
    );
}

function enable() {
    extension = new myExtension("hello");
    extension.settingsObj = new Settings.ExtensionSettings(
        extension.settings_config.keyMap,
        UUID,
    );
    extension.settingsObj.bindProperty(
        Settings.BindingDirection.IN,
        key,
        key,
        setKeybinding,
        null,
    );
    print("settingsObject is ", extension.settingsObj);
    setKeybinding();
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
    extension = null;
    Main.keybindingManager.removeHotKey(keyid);
    global.log("removed mykey key try pressing again");
    // global.display.disconnect(_grabId);
    // global.display.disconnect(_ungrabId);
    // global.log("this is printed when the extension is disabled");
}

function init() {}