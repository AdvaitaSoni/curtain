//------------------------------- UTILITY FUNCTIONS

//@for debugging purposes
function print(str, object) {
    global.log(str, JSON.stringify(object));
}

function windowDEBUG(str, window) {
    let windowDetails = {
        type: window.get_window_type(),
        id: window.get_gtk_application_id(),
        description: window.description()
    }
    print(str, windowDetails)
}