const DEBUG = require("./debugging");
const Main = imports.ui.main;
const Panel = imports.ui.panel;
const Tween = imports.ui.tweener;
const Clutter = imports.gi.Clutter;
const Mainloop = imports.mainloop;
const Meta = imports.gi.Meta;

class WindowManager {
    _monitorMap; //map of monitorIndex to actors list is this necessary and even would work if we precompute
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

    //@UTILITY METHODS
    transformWindowActorWithAnimation(actor, rect, animate = true, time = 0.1, transition = "linear") {
        let metaWindow = actor.get_meta_window();

        if (!animate) {
            ////!! sudden movement section
            metaWindow.move_resize_frame(true, rect.x, rect.y, rect.width, rect.height); //working
        } else {
            ////!!Tween section
            //working if i use move_resize_frame in both update and onComplete
            //using it just on complete also works but change in size is too sudden 
            //what if i apply tween on metawindow? won't work since i don't have any properties on metaWindow
            Tween.addTween(actor, {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                time: time,
                transition: transition,
                onUpdate: (metaWindow) => {
                    let x = actor.get_x();
                    let y = actor.get_y();
                    let width = actor.width;
                    let height = actor.height;
                    metaWindow.move_resize_frame(true, x, y, width, height)
                },
                onComplete: (metaWindow, rect) => {
                    metaWindow.move_resize_frame(true, rect.x, rect.y, rect.width, rect.height)
                },
                onUpdateParams: [metaWindow],
                onCompleteParams: [metaWindow, rect]
            })
        }
    }

    transformWindowActorWithAnimationByVector(actor, vector, animate = true, time = 0.1, transition = "linear") {
        let frameRect = actor.get_meta_window().get_frame_rect();
        let rect = {
            x: frameRect.x + vector.x,
            y: frameRect.y + vector.y,
            width: frameRect.width,
            height: frameRect.height
        }
        this.transformWindowActorWithAnimation(actor, rect, animate, time, transition)
    }

    updateLayoutDetails() {
        let windowActorsInWorkspace = Main.getWindowActorsForWorkspace(
            this.getCurrentWorkspaceIndex(),
        );
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
            }
        });
    }

    getMonitorForActor(actor) {
        return Main.layoutManager.findMonitorForActor(actor);
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

    //@FMETHODS TO GET CURRENT STATE
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

    getFocusedWindow() {
        let focusedMetaWindow = global.display.focus_window;
        if (!focusedMetaWindow || focusedMetaWindow.get_window_type() != 0)
            return null;
        let focusedWindowActor = focusedMetaWindow.get_compositor_private();
        return focusedWindowActor;
    }

    //@METHODS TO GET all THE WINDOWS UNDER VARIOUS CONDITIONS
    //GET ALL WINDOWS OF TYPE 'NORMAL'
    getAllWindows() {
        return global
            .get_window_actors()
            .filter(
                (win) =>
                win &&
                !win.is_destroyed() &&
                win.get_meta_window().get_window_type() == 0,
            );
    }

    //WORKSPACE CONDITIONS
    getAllWindowsOnWorkspace(workspaceIndex) {
        return this.getAllWindows().filter((win) =>
            Main.isWindowActorDisplayedOnWorkspace(win, workspaceIndex),
        );
    }

    getAllWindowsOnCurrentWorkspace() {
        return this.getAllWindowsOnWorkspace(this.getCurrentWorkspaceIndex());
    }

    //MONITOR CONDITIONS
    getAllWindowsOnMonitor(monitor) {
        return this.getAllWindowsOnCurrentWorkspace().filter(
            (win) => this.getMonitorForActor(win) == monitor,
        );
    }
    getAllWindowsOnCurrentMonitor() {
        return this.getAllWindowsOnMonitor(this.getCurrentMonitor());
    }

    //MONITOR WINDOWS THAT ARE VISIBLE ONLY(not minimized)
    getVisibleWindowsOnMonitor(monitor) {
        return this.getAllWindowsOnMonitor(monitor).filter((win) => {
            return !(win.get_meta_window().is_hidden())
        })
    }

    getVisibleWindowsOnCurrentMonitor() {
        return this.getVisibleWindowsOnMonitor(this.getCurrentMonitor())
    }

    getVisibleWindowsOnMonitorBySize(monitor) {
        return this.getVisibleWindowsOnMonitor(monitor).sort((a, b) => ((b.get_meta_window().get_frame_rect().area()) - (a.get_meta_window().get_frame_rect().area())))
    }

    getVisibleWindowsOnCurrentMonitorBySize() {
        return this.getVisibleWindowsOnMonitorBySize(this.getCurrentMonitor())
    }

    getVisibleWindowsOnCurrentMonitorByAlgo() {
            let focusedWindow = this.getFocusedWindow();
            return this.getVisibleWindowsOnCurrentMonitor().sort((a, b) => {
                if (a == focusedWindow) return -1;
                else if (b == focusedWindow) return 1;
                else return ((b.get_meta_window().get_frame_rect().area()) - (a.get_meta_window().get_frame_rect().area()))
            })
        }
        //gets next window to focus
        //if no windows returns null
        //window not focused -> largest area window
        //window focused -> second largest window or the same window
        //@ EVENT METHODS 

    getNext() {
        let windows = this.getVisibleWindowsOnCurrentMonitorByAlgo()
        return windows[1 % windows.length];
    }

    //focusNext will focus on the nextWindow if there is one(even if it is the same) else return nulll
    focusNext() {
        //todo: make a condition in future to only do this task if layout is not disturbec and if disturbed it only arranges the layout
        let nextWindow = this.getNext();
        if (!nextWindow) return;
        nextWindow.get_meta_window().activate(global.get_current_time()); //focus on the next actor
    }

    //window not focused return null with focusNext else swap with the next window if the nextWindow is not the same window
    swapNext() {
        let focusedWindow = this.getFocusedWindow();
        if (!focusedWindow) {
            this.focusNext()
            return;
        };
        let nextWindow = this.getNext();
        if (nextWindow == focusedWindow) {
            return;
        }
        let focusedRect = focusedWindow.get_meta_window().get_frame_rect()
        let focusedRectProperties = {
            x: focusedRect.x,
            y: focusedRect.y,
            width: focusedRect.width,
            height: focusedRect.height
        }

        let nextRect = nextWindow.get_meta_window().get_frame_rect()
        let nextRectProperties = {
            x: nextRect.x,
            y: nextRect.y,
            width: nextRect.width,
            height: nextRect.height
        }
        this.transformWindowActorWithAnimation(focusedWindow, nextRectProperties); //move focused window
        this.transformWindowActorWithAnimation(nextWindow, focusedRectProperties);
    }

    //if windows are 0 don't do anything else if windows are there start from the focused else the largest window
    arrange() {
        //step1: find the focused window
        // let focusedWindows = this.getFocusedWindow();
        //step2 : getAllTheWindowsOpened and sort them by size excluding the focused window(if there) which will be placed at the start
        let windows = this.getVisibleWindowsOnCurrentMonitorByAlgo();
        let monitor = this.getCurrentMonitor() //will have x,y, width, height 
            //step3 : use the half algorithm  - find the monitor rectangle,remaining rect = monitor rectangle and place the ith windows at half or full of the remaining space depeding upon if there are more windows to display
        let widthLeft = monitor.width;
        let heightLeft = monitor.height;
        let X = monitor.x;
        let Y = monitor.y;
        for (let i = 0; i < windows.length; i++) {
            // if (monitorHeightLeft > mo)
            let rect;
            if (i == (windows.length - 1)) {
                //occupy full space
                rect = {
                    x: X,
                    y: Y,
                    width: widthLeft,
                    height: heightLeft
                }
            } else {
                //occupy half space
                if (heightLeft > widthLeft) {
                    rect = {
                        x: X,
                        y: Y,
                        width: widthLeft,
                        heightLeft: heightLeft / 2
                    }
                    Y += (heightLeft / 2);
                    heightLeft = heightLeft / 2;
                } else {
                    rect = {
                        x: X,
                        y: Y,
                        width: widthLeft / 2,
                        height: heightLeft
                    }
                    X += widthLeft / 2;
                    widthLeft = widthLeft / 2;
                }
            }
            //step4 : arrange the windows accordingly
            this.transformWindowActorWithAnimation(windows[i], rect)
        }
    }
    moveNext() {
        //move 
        //step 1: if focused windows doesn't exist arrange,focus on the half secren window and exit
        let focusedWindow = this.getFocusedWindow();
        if (!focusedWindow) {
            this.arrange();
            this.focusNext();
            return;
        }

        //step 2: sort the windows on screen by and if there is only 1 return 
        let windows = this.getVisibleWindowsOnCurrentMonitorBySize();
        if (windows.length == 1) {
            //todo: decide to do something else in this case
            return;
        }

        //step 3: starting from the focused window calculate the vector to move depending on the next largest window
        let focusedWindowIndex = 0;
        for (let i = 0; i < windows.length; i++) {
            let win = windows[i];
            if (win == focusedWindow) {
                focusedWindowIndex = i;
                break;
            }
        };

        let nextLargestWindow;
        let wasPreviousWindow = false;
        if (focusedWindow == windows[windows.length - 1]) {
            let previousWindow = windows[windows.length - 2];
            if (previousWindow.get_meta_window().get_frame_rect().area() == focusedWindow.get_meta_window().get_frame_rect().area()) {
                nextLargestWindow = previousWindow;
                wasPreviousWindow = true;
            } else { //genuinely the smallest window with no ohter window of equal size 
                //todo: change this if needed
                this.focusNext()
                return;
            }
        } else {
            nextLargestWindow = windows[focusedWindowIndex + 1];
        }


        let vector = {
                x: nextLargestWindow.get_meta_window().get_frame_rect().x - focusedWindow.get_meta_window().get_frame_rect().x,
                y: nextLargestWindow.get_meta_window().get_frame_rect().y - focusedWindow.get_meta_window().get_frame_rect().y
            }
            //step 4: move only if the vectory has x or y components entirely 0 (horizontal or vertical vectors would imply no change in layout) + some tolerance if needed 
            //else arrange
            //todo: add tolerance if time
        if (vector.x == 0 || vector.y == 0) {
            //step 5: move the focused window in direction to new coordinates

            this.transformWindowActorWithAnimationByVector(focusedWindow, vector)
                //step 6: translate all the ohter windows to new coordinates
            let revVector = {
                x: -vector.x,
                y: -vector.y
            }
            if (wasPreviousWindow) {
                this.transformWindowActorWithAnimationByVector(nextLargestWindow, revVector)
            } else {
                for (let i = focusedWindowIndex + 1; i < windows.length; i++) {
                    this.transformWindowActorWithAnimationByVector(windows[i], revVector)
                }
            }
        } else {
            this.arrange(windows, focusedWindowIndex);
            // this.focusNext() NO NEED AS FOCUS WILL ALWAYS BE ON THE ALREADY FOCUSED WINDOW
        }
    }
}