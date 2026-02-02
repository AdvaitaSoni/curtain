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
  key1: {
    id: "key1",
    event: () => {
      global.log("hello from event1");
      global.log("eventmgr is null", !eventMgr);
      eventMgr.event1();
      // eventMgr.eventResizeWindow();
    },
  },
  key2: {
    id: "key2",
    event: () => {
      global.log("hello from event2");
      eventMgr.event2();
    },
  },
  key3: {
    id: "key3",
    event: () => {
      eventMgr.event3();
    },
  },
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
      this.settingsMap[key].length > 0
    ) {
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
  }
}
