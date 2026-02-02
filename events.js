const Main = imports.ui.main;
const Panel = imports.ui.panel;
const DEBUG = require("./debugging");
const Meta = imports.gi.Meta;
const Tween = imports.ui.tweener;
const Clutter = imports.gi.Clutter;
//------------------------- EVENTS

class WindowManager {
    _monitorMap; //map of monitorIndex to actors list is this necessary and even would work if we precompute
    // static instance;
    static inst;
    static get instance() {
        if (WindowManager.inst) {
            return WindowManager.inst;
        } else {
            return (WindowManager.inst = new WindowManager());
        }
    }

    constructor() {
        this._monitorMap = {};
        this.updateLayoutDetails();
    }

    /**
     * args: void
     * returns : void
     * description: for a given workspace updates the window -> monitorIdx mapping
     **/
    transformWindowActorWithAnimation(actor, translationParams) {
        Tween.addTween(actor, {
            ...translationParams,
            time: 0.3,
            transition: translationParams.transition || "linear",
            // onStart: () => {},
            onUpdate: (metaWindow) => {
                let x = actor.get_x();
                let y = actor.get_y();
                // global.log("this is called on each update")
                // global.log(`this actor has ${Tween.getTweenCount(actor)} tweens`);
                metaWindow.move_frame(true, x, y);
            },
            // onOverwrite: () => {
            //     global.log("overwrite function called");
            // },
            // onError: () => {
            //     global.log("some error may have occured ");
            // },
            onComplete: () => {
                ///WE CAN ACCESS ACTOR HERE
                // global.log("is this actor ? ", this === actor, this == actor) // no
                // global.log("actor is tweening ?", Tween.isTweening(actor));
                global.log("is this actor ", this instanceof Clutter.Actor, this == actor)
                metaWindow.move_frame(true, newX, newY);
            },
            onUpdateParams: [metaWindow],
            onCompleteParams: [newX, newY],
        });
    }
    updateLayoutDetails() {
        let windowActorsInWorkspace = Main.getWindowActorsForWorkspace(this.getCurrentWorkspaceIndex());
        // let globalWindowActors = global.get_window_actors(); // same as above
        // let allwindowactors = Meta.get_window_actors(global.display);
        windowActorsInWorkspace.forEach((actor) => {
            if (!actor || actor.is_destroyed()) return;
            let metaWindow = actor.get_meta_window();
            if (metaWindow.get_window_type() == 0) {
                let monitorIdx = Main.layoutManager.findMonitorIndexForActor(actor);
                if (!this._monitorMap[monitorIdx]) {
                    this._monitorMap[monitorIdx] = []; //if not assigned
                }
                this._monitorMap[monitorIdx].push(actor);
                actor.set_scale(1, 1);
            }
        });
    }

    /**
     * args: monitorId
     */
    getCurrentWorkspace() {
        return global.screen.get_workspace_by_index(
            global.screen.get_active_workspace_index(),
        );
    }

    getCurrentWorkspaceIndex() {
        return global.screen.get_active_workspace_index();
    }

    getCurrentMonitor() {
        let monitor = Main.layoutManager.currentMonitor;
        return monitor;
    }

    getMonitorForActor(actor) {
        return Main.layoutManager.findMonitorForActor(actor)
            // let monitorIdx = Main.layoutManager.findMonitorIndexForActor(actor);
            // return monitor
    }

    getUsableScreenArea(monitor) {
        let top = monitor.y;
        let bottom = monitor.y + monitor.height;
        let left = monitor.x;
        let right = monitor.x + monitor.width;

        for (let panel of Main.panelManager.getPanelsInMonitor(monitor.index)) {
            if (!panel.isHideable()) {
                switch (panel.panelPosition) {
                    case Panel.PanelLoc.top:
                        top += getPanelHeight(panel);
                        break;
                    case Panel.PanelLoc.bottom:
                        bottom -= getPanelHeight(panel);
                        break;
                    case Panel.PanelLoc.left:
                        left += getPanelHeight(panel); // even vertical panels use 'height'
                        break;
                    case Panel.PanelLoc.right:
                        right -= getPanelHeight(panel);
                        break;
                }
            }
        }

        let width = right > left ? right - left : 0;
        let height = bottom > top ? bottom - top : 0;
        return [left, top, width, height];
    }

    getFocusedWindow() {
        let focusedWindow = global.display.focus_window;
        if (!focusedWindow || focusedWindow.get_window_type() != 0) return null;
        return focusedWindow

    }

    // gives all windows in 
    getAllWindows() {
        return global.get_window_actors().filter(win => (win && !win.is_destroyed() && (window.get_meta_window().get_window_type()) == 0))

    }

    getAllWindowsOnWorkspace(workspaceIndex) {
        return this.getAllWindows().filter(win => Main.isWindowActorDisplayedOnWorkspace(win, workspaceIndex))
    }

    getAllWindowsOnCurrentMonitor() {
        return getAllWindowsOnWorkspace()
    }

    getAllWindowsOnMonitor() {

        }
        //to move up,down,left,right and focus we would need to know the current workspace,current monitor in focus and windows on the current monitor
    focusUp() {
        // step1: find currentworkspace
        let currentworkspace = this.getCurrentWorkspace();
        // step2: find currentFocusedMonitor
        let currentFocusedMonitor = this.getCurrentMonitor(); //@ what does this mean? though monitor where the window is focused or where my mouse is? what if window is not focused
        // let currentFocusedMonitorIndex = Main.layoutManager.monitor
        // step3: find all the windows/interestingActors in the currentFocusedMonitor + areas
        // step4: judge which one to select
        // step5: focus the desiredWindows
    }
}

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
        let window = global.display.focus_window;
        if (!previous) {
            previous = current = window;
        } else {
            previous = current;
            current = window;
        }
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
        previous.activate(global.get_current_time());
        //attempt to make previous as new focused
        global.log("this is event2");
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