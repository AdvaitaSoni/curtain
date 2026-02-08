const Util = imports.misc.util;
class Commands {
    Commands() {}
    static openTerminal(terminalEnable, terminalCmd) {
        if (terminalEnable) Util.spawn(terminalCmd)
    }
    static openMenu(menuEnabled, menuCmd) {
        if (menuEnabled) Util.spawn(menuCmd)
    }
    static openFile(fileEnabled, fileCmd) {
        if (fileEnabled) Util.spawn(fileCmd)
    }
}