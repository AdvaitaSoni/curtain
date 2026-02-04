const DEBUG = require("./debugging");
const { WindowManager } = require("./window");
const Main = imports.ui.main;
const Panel = imports.ui.panel;
const Meta = imports.gi.Meta;
const Tween = imports.ui.tweener;
const Clutter = imports.gi.Clutter;
//------------------------- EVENTS

class EventManager {
    previous;
    current;
    windowMgr;

    static inst;
    static get instance() {
        if (EventManager.inst) {
            return EventManager.inst;
        } else {
            return (EventManager.inst = new EventManager());
        }
    }

    constructor() {
        this.previous = this.current = null;
        this.windowMgr = WindowManager.instance;
    }

    event1() {
        //@use for debugging for now
        // let window = null
        // DEBUG.print("current monitor is ", this.windowMgr.getCurrentMonitor());
        // global.log("inside definition of event1");
        // DEBUG.print("global is ", global);
        // DEBUG.print("global");
        // global.log("prototype of global is ", Object.getPrototypeOf(global));
        // global.log("typeof global is ", typeof global);
        // global.log("global console object is null", !console);
        // global.log("keys of console are ", Object.keys(console));
        // global.log("error function is null ", !console.error);
        // DEBUG.print("console is ", console);

        // console.log("will this print????????????"); //no it did not
        // console.error("will this print2???")
        // this.windowMgr.updateLayoutDetails();
        // DEBUG.print(
        //     "window parent monitor is ",
        //     // Main.layoutManager.findMonitorForActor(window),
        // );
        // global.log(global.)
        // global.log("hello from event 1");
        try {
            // this.windowMgr.focusNext(); //@Passed
            //   this.windowMgr.swapNext(); //@Passed
            // this.windowMgr.arrange() //@Passed
            this.windowMgr.moveNext();
        } catch (e) {
            global.log("error in event1 ", e.message);
        }
        // global.log("monitor is ", this.windowMgr.getCurrentMonitor());
        // global.log("monitor is ", )
        // let window = global.display.focus_window;
        // if (!previous) {
        //     previous = current = window;
        // } else {
        //     previous = current;
        //     current = window;
        // }
    }

    eventResizeWindow() {
        let window = this.windowMgr.getFocusedWindow();
        let monitor = this.windowMgr.getCurrentMonitor();
        let [screenX, screenY, screenWidth, screenHeight] =
        this.windowMgr.getUsableScreenArea(monitor);
        window.x = screenX;
        window.y = screenY;
        window.width = screenWidth;
        window.height = screenHeight;
    }
    event2() {
        global.log("this is event2");
        // previous.activate(global.get_current_time());
        //attempt to make previous as new focused
        let w = this.windowMgr.getFocusedWindow();
        global.log("focused window details", w.x, w.y, w.width, w.height);
    }

    event3() {
        global.log("this is event3");
    }
}

//! TESTING CODE
/*
let answer = Main.getWindowActorsForWorkspace();
global.get_window_actors()
workspace.activate(global.get_current_time());
 monitorIndex = Main.layoutManager.findMonitorIndexAt(++x, ++y);
let windowActor = this._window.get_compositor_private(); and caln call .get_first_child(),.height,.width
monitor = Main.layoutManager.findMonitorForActor() //doesn't work for windows
 global.bottom_window_group.hide(); and .show()
 Main.layoutManager.monitors[i];
 NUMBEROFMONITORS = global.display.get_n_monitors();

let tracker = Cinnamon.WindowTracker.get_default();
    let windowApp = tracker.get_window_app(this._window);
    if (windowApp) {
        name = windowApp.get_name();
    }
    else {
        name = this._window.get_title();
    }
let keyFocus = global.stage.key_focus;
window.check_alive(global.display.get_current_time_roundtrip())

function hasMouseWindow(){
    let window = global.display.get_pointer_window(null);
    return window && window.window_type !== Meta.WindowType.DESKTOP;
}

function(source, actor, x, y, time) {
            if (source.metaWindow) {
             Main.moveWindowToNewWorkspace(source.metaWindow);
            }
}
global.window_group.show();


let xinerama_index = global.display.logical_index_to_xinerama_index(current.index);
let logical_index = global.display.xinerama_index_to_logical_index(index);
let rect = global.workspace_manager.get_active_workspace().get_work_area_for_monitor(logical_index);
if (Main.monitorLabeler != null) { //SEE MORE
            Main.monitorLabeler.show(monitor_info[0], invocation.get_sender());
        }

global.log("global background actor is ", global.background_actor);
if (!actorData.visibleInFullscreen && monitor && monitor.inFullscreen)

global.window_manager.disconnect(this.switchWorkspaceNotifyId);
global.window_manager.connect('switch-workspace', Lang.bind(this, this.activeWorkspaceChanged));


function isPopupMetaWindow(actor) {
    switch(actor.meta_window.get_window_type()) {
    case Meta.WindowType.DROPDOWN_MENU:
    case Meta.WindowType.POPUP_MENU:
    case Meta.WindowType.COMBO:
        return true;
    default:
        return false;
    }
}
*/

//! TESTING ENDS

//@expo-thumbnail for more details

//** REQUIREMENTS
//**1. GIVEN A MONITOR HOW CAN I FIND ALL THE WINDOWS IN IT
//** */

/*

rough



*/