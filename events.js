const { WindowManager } = require("./window");
class EventManager {
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
        this.windowMgr = WindowManager.instance;
    }

    destroy() {
        this.windowMgr.destroy()
        this.windowMgr = null
        EventManager.inst = null;
    }

    arrange() {
        this.windowMgr.arrange()
    }

    focusToNextAlgorithmically() {
        this.windowMgr.focusNext()
    }

    swapToNextAlgorithmically() {
        this.windowMgr.swapNext()
    }

    moveInDirectionOfNextNode() {
        this.windowMgr.moveNext()
    }

    minimize() {
        this.windowMgr.minimize()
    }

    fullMaximize() {
        this.windowMgr.fullMaximize()
    }

    halfMaximize() {
        this.windowMgr.halfMaximize()
    }

    unmaximize() {
        this.windowMgr.unmaximize()
    }
    moveSwitchWorkspace1() {
        this.windowMgr.moveToWorkspace(1);
    }
    moveSwitchWorkspace2() {
        this.windowMgr.moveToWorkspace(2);
    }
    moveSwitchWorkspace3() {
        this.windowMgr.moveToWorkspace(3);
    }
    moveSwitchWorkspace4() {
        this.windowMgr.moveToWorkspace(4);
    }
    moveSwitchWorkspace5() {
        this.windowMgr.moveToWorkspace(5);
    }
    moveSwitchWorkspace6() {
        this.windowMgr.moveToWorkspace(6);
    }
    moveSwitchWorkspace7() {
        this.windowMgr.moveToWorkspace(7);
    }
    moveSwitchWorkspace8() {
        this.windowMgr.moveToWorkspace(8);
    }
    moveSwitchWorkspace9() {
        this.windowMgr.moveToWorkspace(9);
    }
    moveSwitchNextWorkspace() {
        let index = global.screen.get_active_workspace_index() + 1;
        this.windowMgr.moveToWorkspace(index + 1);
    }
    moveSwitchPrevWorkspace() {
        let index = global.screen.get_active_workspace_index() + 1;
        this.windowMgr.moveToWorkspace(index - 1);
    }

    //for switching
    switchWorkspace1() {
        this.windowMgr.switchWorkspace(1);
    }
    switchWorkspace2() {
        this.windowMgr.switchWorkspace(2);
    }
    switchWorkspace3() {
        this.windowMgr.switchWorkspace(3);
    }
    switchWorkspace4() {
        this.windowMgr.switchWorkspace(4);
    }
    switchWorkspace5() {
        this.windowMgr.switchWorkspace(5);
    }
    switchWorkspace6() {
        this.windowMgr.switchWorkspace(6);
    }
    switchWorkspace7() {
        this.windowMgr.switchWorkspace(7);
    }
    switchWorkspace8() {
        this.windowMgr.switchWorkspace(8);
    }
    switchWorkspace9() {
        this.windowMgr.switchWorkspace(9);
    }
    switchNextWorkspace() {
        let index = global.screen.get_active_workspace_index() + 1;
        this.windowMgr.switchWorkspace(index + 1);
    }
    switchPrevWorkspace() {
        let index = global.screen.get_active_workspace_index() + 1;
        this.windowMgr.switchWorkspace(index - 1);
    }
    kill() {
        this.windowMgr.closeWindow();
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