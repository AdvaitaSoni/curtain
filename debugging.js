//------------------------------- UTILITY FUNCTIONS

//@for debugging purposes
function print(str, object) {
    global.log(str, JSON.stringify(object));
}

function windowPrint(str, window) {
    if (!window) {
        global.log(str, null)
        return;
    }
    let windowDetails = {
        type: window.get_meta_window().get_window_type(),
        appId: window.get_meta_window().get_gtk_application_id(),
        id: window.get_meta_window().get_id(),
        description: window.get_meta_window().get_description(),
    };
    global.log(str, JSON.stringify(windowDetails));
}
//userful for debugging
// kill() {
//     let focusedWindow = this.getFocusedWindow()
//     let metaWindow = focusedWindow.get_meta_window();
//     // metaWindow.kill()
//     let pid = metaWindow.get_pid()
//     let gid = metaWindow.get_gtk_application_id()
//     let id = metaWindow.get_id()
//     let hints = metaWindow.mutter_hints
//     let sandboxedAppId = metaWindow.get_sandboxed_app_id()
//     let stableSeq = metaWindow.get_stable_sequence()
//     let startupId = metaWindow.get_startup_id();
//     global.log("pid is ", pid)
//     global.log("id is", id)
//     global.log("gid is", gid)
//     global.log("sandboxed id is ", sandboxedAppId);
//     global.log("stableSeq is ", stableSeq)
//     global.log("startup id is ", startupId);
//     DEBUG.print("hints are ", hints)
//     return pid
// }