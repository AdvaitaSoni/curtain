const DEBUG = require("./debugging");
const Main = imports.ui.main;
const Panel = imports.ui.panel;
const Tween = imports.ui.tweener;
const Clutter = imports.gi.Clutter;
const Mainloop = imports.mainloop;
const Meta = imports.gi.Meta;
const SignalManager = imports.misc.signalManager;

class WindowManager {
    signalManager;
    static inst;
    static get instance() {
        if (WindowManager.inst) {
            return WindowManager.inst;
        } else {
            return (WindowManager.inst = new WindowManager());
        }
    }

    constructor() {
        this.signalManager = new SignalManager.SignalManager();
        this.disconnectAllSignals();
        this.connectAllSignals();
    }

    destroy() {
        this.disconnectAllSignals();
        this.signalManager = null;
        WindowManager.inst = null
    }

    //@UTILITY METHODS
    transformWindowActorWithAnimation(actor, rect, animate = true, time = 1, transition = "linear", ) {
        let metaWindow = actor.get_meta_window();
        let frame = metaWindow.get_frame_rect();
        if (
            frame.x == rect.x &&
            frame.y == rect.y &&
            frame.width == rect.width &&
            frame.height == rect.height
        ) {
            return;
        }
        metaWindow.unmaximize(Meta.MaximizeFlags.BOTH);
        // try {
        //     // global.log("window is maximized? ", metaWindow.is_maximized())
        //     // global.log("window is maximized? ", metaWindow.is_fullscreen())
        //     // global.log("window is monitor size?", metaWindow.is_monitor_sized())
        //     global.log("horizontally maximized", metaWindow.maximimized_horizontally);
        //     global.log("vertically maximized??", metaWindow.maximimized_vertically);
        //     global.log("fullscreen??", metaWindow.fullscreen)
        // } catch (e) {
        //     global.log('error in maximize deciding ', e.message)
        // }

        if (!animate) {
            ////!! sudden movement section
            metaWindow.move_resize_frame(
                true,
                rect.x,
                rect.y,
                rect.width,
                rect.height,
            ); //working
        } else {
            ////!!Tween section
            //working if i use move_resize_frame in both update and onComplete
            //using it just on complete also works but change in size is too sudden
            //what if i apply tween on metawindow? won't work since i don't have any properties on metaWindow
            global.log("adding tween", rect)
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
                    metaWindow.move_resize_frame(true, x, y, width, height);
                },
                onComplete: (metaWindow, rect) => {
                    metaWindow.move_resize_frame(
                        true,
                        rect.x,
                        rect.y,
                        rect.width,
                        rect.height,
                    );
                },
                onUpdateParams: [metaWindow],
                onCompleteParams: [metaWindow, rect],
            });
        }
    }

    transformWindowActorWithAnimationByVector(actor, vector, animate = true, time = 1, transition = "linear", ) {
        let frameRect = actor.get_meta_window().get_frame_rect();
        let rect = {
            x: frameRect.x + vector.x,
            y: frameRect.y + vector.y,
            width: frameRect.width,
            height: frameRect.height,
        };
        this.transformWindowActorWithAnimation(
            actor,
            rect,
            animate,
            time,
            transition,
        );
    }

    getMonitorForActor(actor) {
        return Main.layoutManager.findMonitorForActor(actor);
    }

    metaWindowsAreAdjacent(metaWin1, metaWin2, cutoff = 0) {
        //common is specified in px and all the common lengths below common are rejected
        let frame1 = {
            x1: metaWin1.get_frame_rect().x,
            y1: metaWin1.get_frame_rect().y,
            x2: metaWin1.get_frame_rect().x + metaWin1.get_frame_rect().width,
            y2: metaWin1.get_frame_rect().y + metaWin1.get_frame_rect().height,
        };
        let frame2 = {
            x1: metaWin2.get_frame_rect().x,
            y1: metaWin2.get_frame_rect().y,
            x2: metaWin2.get_frame_rect().x + metaWin2.get_frame_rect().width,
            y2: metaWin2.get_frame_rect().y + metaWin2.get_frame_rect().height,
        };

        if (frame1.y1 == frame2.y2 || frame1.y2 == frame2.y1) {
            //for sharing top-edge and bottom-edge
            return (
                Math.min(frame1.x2, frame2.x2) - Math.max(frame1.x1, frame2.x1) > cutoff
            );
        } else if (frame1.x1 == frame2.x2 || frame1.x2 == frame2.x1) {
            //for sharing left and right edge
            return (
                Math.min(frame1.y2, frame2.y2) - Math.max(frame1.y1, frame2.y1) > cutoff
            );
        }
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

    //@all signal handeling is done here
    connectAllSignals() {
        this.signalManager.connect(
            global.window_manager,
            "minimize",
            this.onMinimize,
            this,
        );
        this.signalManager.connect(
            global.window_manager,
            "unminimize",
            this.onUnminimize,
            this,
        );
        this.signalManager.connect(
            global.display,
            "window-created",
            this.onWindowCreated,
            this,
        );
        this.signalManager.connect(
            global.screen,
            "window-removed",
            (_, window) => {
                if (window.get_window_type() != 0) {
                    return;
                }
                try {
                    this.screenDisapper(window);
                } catch (e) {
                    global.log("got an error on screen disapper", e.message);
                }
            },
            this,
        );
    }

    disconnectAllSignals() {
        this.signalManager.disconnectAllSignals();
    }

    onWindowCreated(_, window) {
        if (window.get_window_type() != 0) {
            return;
        }
        // global.log("(*****getting mutter hints: ********", window._MUTTER_HINTS)
        // /let client_rect = window.client_rect_to_frame_rect(window.get_frame_rect())
        // let stage_rect = window.protocol_to_stage_rect(window.get_frame_rect())
        // global.log("client rect to frame rect", client_rect.x, client_rect.y, client_rect.width, client_rect.height)
        // global.log("client rect to frame rect", stage_rect.x, stage_rect.y, stage_rect.width, stage_rect.height)
        this.screenAppear(window);
    }


    onMinimize(_, actor) {
        let window = actor.get_meta_window();
        if (window.get_window_type() != 0) {
            return;
        }
        try {
            this.screenDisapper(window);
        } catch (e) {
            global.log("got an error on screen disapper", e.message);
        }
    }

    onUnminimize(_, actor) {
        let window = actor.get_meta_window();
        if (window.get_window_type() != 0) {
            return;
        }
        try {
            // global.log("(*****getting mutter hints: ********", window._MUTTER_HINTS)
            // let client_rect = window.client_rect_to_frame_rect(window.get_frame_rect())
            // let stage_rect = window.protocol_to_stage_rect(window.get_frame_rect())
            // global.log("client rect to frame rect", client_rect.x, client_rect.y, client_rect.width, client_rect.height)
            // global.log("client rect to frame rect", stage_rect.x, stage_rect.y, stage_rect.width, stage_rect.height)
            this.screenAppear(window);
        } catch (e) {
            global.log("got an error on screen appear");
        }
    }

    screenDisapper(closedWindow) {
        //@is actually of type metaWindow

        //TRUE closed window is visible
        let closedWindowArea = closedWindow.get_frame_rect().area();
        let windows = this.getVisibleWindowsOnCurrentMonitorBySize();

        // let closedWindowIndex;
        let windowsToRepaint = [];
        let shouldBeAdjacentTo = closedWindow;
        let targetArea = closedWindowArea;
        for (let i = 0; i < windows.length; i++) {
            let win = windows[i];
            let metaWin = win.get_meta_window();
            if (metaWin == closedWindow) continue;
            if (this.metaWindowsAreAdjacent(metaWin, shouldBeAdjacentTo)) {
                let winArea = metaWin.get_frame_rect().area();
                if (winArea <= targetArea) {
                    windowsToRepaint.push(win);
                    shouldBeAdjacentTo = metaWin;
                    targetArea = winArea;
                }
            }
        }
        if (windowsToRepaint.length == 0) return -1;

        let metaWin1 = closedWindow;
        let metaWin2 = windowsToRepaint[0].get_meta_window();
        let frame1 = {
            x1: metaWin1.get_frame_rect().x,
            y1: metaWin1.get_frame_rect().y,
            x2: metaWin1.get_frame_rect().x + metaWin1.get_frame_rect().width,
            y2: metaWin1.get_frame_rect().y + metaWin1.get_frame_rect().height,
            height: metaWin1.get_frame_rect().height,
            width: metaWin1.get_frame_rect().width,
        };
        let frame2 = {
            x1: metaWin2.get_frame_rect().x,
            y1: metaWin2.get_frame_rect().y,
            x2: metaWin2.get_frame_rect().x + metaWin2.get_frame_rect().width,
            y2: metaWin2.get_frame_rect().y + metaWin2.get_frame_rect().height,
            height: metaWin2.get_frame_rect().height,
            width: metaWin2.get_frame_rect().width,
        };

        let rect = {};
        if (frame1.y1 == frame2.y2 || frame1.y2 == frame2.y1) {
            //for sharing top-edge and bottom-edge + condn: both should have the same x1 and height
            if (frame1.x1 == frame2.x1 && frame1.height == frame2.height) {
                rect = {
                    x: frame1.x1,
                    y: Math.min(frame1.y1, frame2.y1),
                    width: Math.max(frame1.width, frame2.width),
                    height: frame1.height * 2,
                };
            } else return -1;
        } else if (frame1.x1 == frame2.x2 || frame1.x2 == frame2.x1) {
            //for sharing left and right edge + condn: both should have the same y1 and width
            if (frame1.y1 == frame2.y1 && frame1.width == frame2.width) {
                rect = {
                    x: Math.min(frame1.x1, frame2.x1),
                    y: frame1.y1,
                    width: frame1.width * 2,
                    height: Math.max(frame1.height, frame2.height),
                };
            } else return -1;
        }
        try {
            this.customArrange(windowsToRepaint, rect);
        } catch (e) {
            global.log("error in custom arrange", e.message);
        }
    }

    screenAppear(openedWindow, windows = null) {
        let openedWindowActor = openedWindow.get_compositor_private()
        if (!windows) {
            windows = this.getVisibleWindowsOnCurrentMonitorBySize()
        }
        global.log("windows length is ", windows.length)
        let [x, y, width, height] = this.getUsableScreenArea(this.getCurrentMonitor())
            // try {
        let isLayoutArranged = this.verifyLayout(windows.filter((win) => { return win != openedWindowActor }), {
            x,
            y,
            width,
            height
        })
        if (!(isLayoutArranged)) {
            // this.arrange(windows.filter((win) => { win != openedWindowActor }))
            return //@just return if the layout is not made since user most probably isn't looking to use the extension
        }
        // } catch (e) {
        //     global.log("error in layout calculation", e.message)
        // }

        let windowDetails = {
            type: windows[0].get_meta_window().get_window_type(),
            appId: windows[0].get_meta_window().get_gtk_application_id(),
            id: windows[0].get_meta_window().get_id(),
            description: windows[0].get_meta_window().get_description(),
        };
        global.log("windows on screen appear are", windowDetails)
            //this makes sure that windows is not opened in full screen causing unneccessary modification to the  whole layout  
        openedWindow.begin_grab_op(Meta.GrabOp.KEYBOARD_RESIZING_UNKNOWN, true, global.get_current_time())
        global.display.end_grab_op(global.get_current_time());
        if (windows.length == 1) {
            //make this window full screen
            let [x, y, width, height] = this.getUsableScreenArea(this.getCurrentMonitor())
            this.transformWindowActorWithAnimation(openedWindowActor, {
                x,
                y,
                width,
                height
            })
            return
        }
        let windowToModify
        for (let i = windows.length - 1; i >= 0; i--) {
            if (windows[i] == openedWindowActor) continue;
            else {
                windowToModify = windows[i];
                break;
            }
        };
        let frame = windowToModify.get_meta_window().get_frame_rect();
        let rect = {
            x: frame.x,
            y: frame.y,
            width: frame.width,
            height: frame.height
        }
        let windowsToRepaint = [windowToModify, openedWindowActor];
        global.log("rect is ", rect)
        this.customArrange(windowsToRepaint, rect)
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

    //SORTED VERSION OF ABOVE
    getAllWindowsOnMonitorBySize(monitor) {
        return this.getAllWindowsOnMonitor(monitor).sort((a, b) => {
            return (
                b.get_meta_window().get_frame_rect().area() -
                a.get_meta_window().get_frame_rect().area()
            );
        });
    }

    getAllWindowsOnCurrentMonitorBySize() {
        return this.getAllWindowsOnMonitorBySize(this.getCurrentMonitor());
    }

    //MONITOR WINDOWS THAT ARE VISIBLE ONLY(not minimized)
    getVisibleWindowsOnMonitor(monitor) {
        return this.getAllWindowsOnMonitor(monitor).filter((win) => {
            return !win.get_meta_window().minimized;
        });
    }

    getVisibleWindowsOnCurrentMonitor() {
        return this.getVisibleWindowsOnMonitor(this.getCurrentMonitor());
    }

    getVisibleWindowsOnWorkspaceAndMonitorBySize(workspaceIndex, monitor) {
        global.log("workspace windows are", this.getAllWindowsOnWorkspace(workspaceIndex).length)
        let windows = this.getAllWindowsOnWorkspace(workspaceIndex).filter((win) => {
            // global.log("id is ", win.get_meta_window().get_gtk_application_id())
            // global.log("is hidden?", !win.get_meta_window().is_hidden())
            // global.log("is minimized? ", win.get_meta_window().minimized)
            return (!win.get_meta_window().minimized && this.getMonitorForActor(win) == monitor)
        })
        return windows.sort((a, b) => {
            let value = b.get_meta_window().get_frame_rect().area() -
                a.get_meta_window().get_frame_rect().area()
            if (value != 0) return value;
            else {
                let frameA = a.get_meta_window().get_frame_rect()
                let frameB = b.get_meta_window().get_frame_rect();
                let centerA = {
                    x: frameA.x + (frameA.width / 2),
                    y: frameA.y + (frameA.height / 2)
                }
                let centerB = {
                    x: frameB.x + (frameB.width / 2),
                    y: frameB.y + (frameB.height / 2)
                }
                if ((centerA.x < centerB.x) || (centerA.y < centerB.y)) {
                    return -1
                } else {
                    return 1
                }
            }
        })
    }

    //todo: eliminaate those here that are not being called and optimize each of them instead of calling the one before
    getVisibleWindowsOnMonitorBySize(monitor) {
        return this.getVisibleWindowsOnMonitor(monitor).sort(
            (a, b) => {
                let value = b.get_meta_window().get_frame_rect().area() -
                    a.get_meta_window().get_frame_rect().area()
                if (value != 0) return value;
                else {
                    let frameA = a.get_meta_window().get_frame_rect()
                    let frameB = b.get_meta_window().get_frame_rect();
                    let centerA = {
                        x: frameA.x + (frameA.width / 2),
                        y: frameA.y + (frameA.height / 2)
                    }
                    let centerB = {
                        x: frameB.x + (frameB.width / 2),
                        y: frameB.y + (frameB.height / 2)
                    }
                    if ((centerA.x < centerB.x) || (centerA.y < centerB.y)) {
                        return -1
                    } else {
                        return 1
                    }
                }

            }
        );
    }

    getVisibleWindowsOnCurrentMonitorBySize() {
        return this.getVisibleWindowsOnMonitorBySize(this.getCurrentMonitor());
    }


    getVisibleWindowsOnCurrentMonitorBySizeWithFocusFirst(focusedWindow) {
        return this.getVisibleWindowsOnCurrentMonitor().sort((a, b) => {
            if (a == focusedWindow) return -1;
            else if (b == focusedWindow) return 1;
            else {
                let value = (b.get_meta_window().get_frame_rect().area() -
                    a.get_meta_window().get_frame_rect().area());
                if (value != 0) return value;
                else {
                    let frameA = a.get_meta_window().get_frame_rect()
                    let frameB = b.get_meta_window().get_frame_rect();
                    let centerA = {
                        x: frameA.x + (frameA.width / 2),
                        y: frameA.y + (frameA.height / 2)
                    }
                    let centerB = {
                        x: frameB.x + (frameB.width / 2),
                        y: frameB.y + (frameB.height / 2)
                    }
                    if ((centerA.x < centerB.x) || (centerA.y < centerB.y)) {
                        return -1
                    } else {
                        return 1
                    }
                }
            }
        });
    }
    getVisibleWindowsOnCurrentMonitorBySizeWithFocusLast(focusedWindow) {
        return this.getVisibleWindowsOnCurrentMonitor().sort((a, b) => {
            if (a == focusedWindow) return 1;
            else if (b == focusedWindow) return -1;
            else {
                let value = (b.get_meta_window().get_frame_rect().area() -
                    a.get_meta_window().get_frame_rect().area());
                if (value != 0) return value;
                else {
                    let frameA = a.get_meta_window().get_frame_rect()
                    let frameB = b.get_meta_window().get_frame_rect();
                    let centerA = {
                        x: frameA.x + (frameA.width / 2),
                        y: frameA.y + (frameA.height / 2)
                    }
                    let centerB = {
                        x: frameB.x + (frameB.width / 2),
                        y: frameB.y + (frameB.height / 2)
                    }
                    if ((centerA.x < centerB.x) || (centerA.y < centerB.y)) {
                        return -1
                    } else {
                        return 1
                    }
                }
            }
        });
    }

    //gets next window to focus
    //if no windows returns null
    //window not focused -> largest area window
    //window focused -> second largest window or the same window
    //@ EVENT METHODS
    getNext() {
        let windows = this.getVisibleWindowsOnCurrentMonitorBySize();
        let focusedWindow = this.getFocusedWindow();
        if (window.length == 0) return null;
        let index = -1;
        for (let i = 0; i < windows.length; i++) {
            if (windows[i] == focusedWindow) {
                index = i;
                break;
            }
        }
        return windows[(index + 1) % windows.length]
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
            this.focusNext();
            return;
        }
        let nextWindow = this.getNext();
        if (nextWindow == focusedWindow) {
            return;
        }
        let focusedRect = focusedWindow.get_meta_window().get_frame_rect();
        let focusedRectProperties = {
            x: focusedRect.x,
            y: focusedRect.y,
            width: focusedRect.width,
            height: focusedRect.height,
        };

        let nextRect = nextWindow.get_meta_window().get_frame_rect();
        let nextRectProperties = {
            x: nextRect.x,
            y: nextRect.y,
            width: nextRect.width,
            height: nextRect.height,
        };
        this.transformWindowActorWithAnimation(focusedWindow, nextRectProperties); //move focused window
        this.transformWindowActorWithAnimation(nextWindow, focusedRectProperties);
    }

    verifyLayout(windowsArray, rect) {
        //solve by recursion for now and 
        let X = rect.x;
        let Y = rect.y;
        let widthLeft = rect.width
        let heightLeft = rect.height
        let answer = true
        global.log("windowsArray length is ", windowsArray.length)
        for (let i = 0; i < windowsArray.length; i++) {
            let window = windowsArray[i];
            let frame = window.get_meta_window().get_frame_rect();
            //verify if windows is in one of the two locations
            let rect1, rect2;
            if (i == windowsArray.length - 1) {
                rect1 = rect2 = {
                    x: X,
                    y: Y,
                    width: widthLeft,
                    height: heightLeft,
                };
                global.log("single case:")
                global.log("frame is x", frame.x, frame.y, frame.width, frame.height)
                global.log("rect1 is ", rect1, "rect2 is ", rect2)
                if (frame.x != rect1.x || frame.y != rect1.y || frame.width != rect1.width || frame.height != rect1.height) {
                    answer = false;
                    global.log("answer is ", answer)
                    break;
                }
            } else {
                //occupy half space
                if (heightLeft > widthLeft) {
                    rect1 = {
                        x: X,
                        y: Y,
                        width: widthLeft,
                        height: heightLeft / 2,
                    };
                    rect2 = {
                        x: X,
                        y: Y + heightLeft / 2,
                        width: widthLeft,
                        height: heightLeft / 2
                    }
                    global.log("height case:")
                    global.log("frame is x", frame.x, frame.y, frame.width, frame.height)
                    global.log("rect1 is ", rect1, "rect2 is ", rect2)
                    if (frame.x == rect1.x && frame.y == rect1.y && frame.width == rect1.width && frame.height == rect1.height) {
                        Y += heightLeft / 2;
                    } else if (frame.x == rect2.x && frame.y == rect2.y && frame.width == rect2.width && frame.height == rect2.height) {
                        //Y remains the same
                    } else {
                        answer = false;
                        global.log("answer is ", answer)
                        break;
                    }
                    heightLeft = heightLeft / 2;
                } else {
                    rect1 = {
                        x: X,
                        y: Y,
                        width: widthLeft / 2,
                        height: heightLeft,
                    };
                    rect2 = {
                        x: X + widthLeft / 2,
                        y: Y,
                        width: widthLeft / 2,
                        height: heightLeft
                    }
                    global.log("width case:")
                    global.log("frame is x", frame.x, frame.y, frame.width, frame.height)
                    global.log("rect1 is ", rect1, "rect2 is ", rect2)
                    if (frame.x == rect1.x && frame.y == rect1.y && frame.width == rect1.width && frame.height == rect1.height) {
                        X += widthLeft / 2;
                    } else if (frame.x == rect2.x && frame.y == rect2.y && frame.width == rect2.width && frame.height == rect2.height) {
                        //X remains the same
                    } else {
                        answer = false;
                        global.log("answer is ", answer)
                        break;
                    }
                    widthLeft = widthLeft / 2;
                }
            }
        }
        global.log("answer is ", answer)
        return answer
    }

    //if windows are 0 don't do anything else if windows are there start from the focused else the largest window
    customArrange(windowsArray, area, index = 0) {
        if (index >= windowsArray.length) return;
        let X = area.x;
        let Y = area.y;
        let widthLeft = area.width;
        let heightLeft = area.height;
        for (let i = index; i < windowsArray.length; i++) {
            // if (windowsArray[i].get_meta_window().is_hidden()) continue; //@assume this case will never be called
            // if (blacklistMetaWindow && windowsArray[i].get_meta_window() == blacklistMetaWindow) continue; //@assume this case will never be called
            let rect;
            if (i == windowsArray.length - 1) {
                rect = {
                    x: X,
                    y: Y,
                    width: widthLeft,
                    height: heightLeft,
                };
            } else {
                //occupy half space
                if (heightLeft > widthLeft) {
                    rect = {
                        x: X,
                        y: Y,
                        width: widthLeft,
                        height: heightLeft / 2,
                    };
                    Y += heightLeft / 2;
                    heightLeft = heightLeft / 2;
                } else {
                    rect = {
                        x: X,
                        y: Y,
                        width: widthLeft / 2,
                        height: heightLeft,
                    };
                    X += widthLeft / 2;
                    widthLeft = widthLeft / 2;
                }
            }
            this.transformWindowActorWithAnimation(windowsArray[i], rect);
        }
    }

    arrange(windows = null) {
        if (!windows) {
            windows = this.getVisibleWindowsOnCurrentMonitorBySize()
        }
        global.log("windows for arrange is ", windows)
        let [x, y, width, height] = this.getUsableScreenArea(this.getCurrentMonitor())
        this.customArrange(windows, {
            x: x,
            y: y,
            width: width,
            height: height,
        });
    }

    moveNext() {
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
        }

        let nextLargestWindow;
        let wasPreviousWindow = false;
        if (focusedWindow == windows[windows.length - 1]) {
            let previousWindow = windows[windows.length - 2];
            if (
                previousWindow.get_meta_window().get_frame_rect().area() ==
                focusedWindow.get_meta_window().get_frame_rect().area()
            ) {
                nextLargestWindow = previousWindow;
                wasPreviousWindow = true;
            } else {
                //genuinely the smallest window with no ohter window of equal size
                //todo: change this if needed
                this.focusNext();
                return;
            }
        } else {
            nextLargestWindow = windows[focusedWindowIndex + 1];
        }

        let vector = {
            x: nextLargestWindow.get_meta_window().get_frame_rect().x -
                focusedWindow.get_meta_window().get_frame_rect().x,
            y: nextLargestWindow.get_meta_window().get_frame_rect().y -
                focusedWindow.get_meta_window().get_frame_rect().y,
        };
        //step 4: move only if the vectory has x or y components entirely 0 (horizontal or vertical vectors would imply no change in layout) + some tolerance if needed
        //else arrange
        if (vector.x == 0 || vector.y == 0) {
            //step 5: move the focused window in direction to new coordinates

            this.transformWindowActorWithAnimationByVector(focusedWindow, vector);
            //step 6: translate all the ohter windows to new coordinates
            let revVector = {
                x: -vector.x,
                y: -vector.y,
            };
            if (wasPreviousWindow) {
                this.transformWindowActorWithAnimationByVector(
                    nextLargestWindow,
                    revVector,
                );
            } else {
                for (let i = focusedWindowIndex + 1; i < windows.length; i++) {
                    this.transformWindowActorWithAnimationByVector(windows[i], revVector);
                }
            }
        } else {
            this.arrange(windows, focusedWindowIndex);
        }
    }

    halfMaximize() {
        let focusedWindow = this.getFocusedWindow();
        let [x, y, width, height] = this.getUsableScreenArea(this.getCurrentMonitor());
        let windows = this.getVisibleWindowsOnCurrentMonitorBySizeWithFocusFirst(focusedWindow);
        let rect = {
            x,
            y,
            width,
            height
        }
        this.customArrange(windows, rect)
            // this.transformWindowActorWithAnimation(windows, rec)
    }
    fullMaximize() {
        let focusedWindow = this.getFocusedWindow();
        let metaWindow = focusedWindow.get_meta_window();
        metaWindow.maximize(Meta.MaximizeFlags.BOTH);
    }
    unmaximize() {
        let focusedWindow = this.getFocusedWindow();
        let metaWindow = focusedWindow.get_meta_window();
        metaWindow.unmaximize(Meta.MaximizeFlags.BOTH);
    }
    minimize() {
        let focusedWindow = this.getFocusedWindow();
        let metaWindow = focusedWindow.get_meta_window();
        metaWindow.minimize();
    }

    moveToWorkspace(index) {
        try {
            if (index < 1) return;
            let focusedWindow = this.getFocusedWindow();
            if (!focusedWindow) return
            let meta_window = focusedWindow.get_meta_window();
            meta_window.change_workspace_by_index(index - 1, true);
            this.screenDisapper(meta_window)
            this.switchWorkspace(index);
            let targetWorkspaceWindows = this.getVisibleWindowsOnWorkspaceAndMonitorBySize(index - 1, this.getCurrentMonitor())
            global.log("target workspace windows are ", targetWorkspaceWindows)
            this.screenAppear(meta_window, targetWorkspaceWindows)
        } catch (e) {
            global.log("Error in moving window", e.message)
        }
    }
    switchWorkspace(index) {
        if (index < 1) return
        let workspace = global.screen.get_workspace_by_index(index - 1)
        workspace.activate(global.get_current_time());
    }
    closeWindow() {
        let window = this.getFocusedWindow().get_meta_window();
        // global.display.close(global.get_current_time())
        if (window.can_close()) {
            window.delete(global.get_current_time())
        };
    }

}