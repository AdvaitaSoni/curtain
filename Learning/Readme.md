# Introduction
- Most of the code of Linux Mint is written in C. Extensions, however, are written in js. So to include the APIs written in C in extensions,applets,desklets etc. we use something called as cjs. It is almost js but with access to mint APIs
- to import code written in another file(.js) we use `imports` statement. e.g

```
//Direct access to file a.js
const A = imports.a;
//Directories must be also typed in, in order to get file c.js in directory b
const C = imports.b.c;
```

- we can also import cjs core modules like below. For more comprehensive list go to [here](https://github.com/linuxmint/cjs/tree/master/modules)

```
const Cairo = imports.cairo; //Cairo graphics
const Lang = imports.lang; //useful JavaScript functions for extensing the language
const Gettext = imports.gettext; //Gettext translation
const TweenEquations = imports.tweener.equations; //Tween equations for animations
```

- to use C libraries for Clutter,Muffin and more, import it via `imports.g.*`. For ex:

```
const St = imports.gi.St;
const Cinnamon = imports.gi.Cinnamon
```

- to import Cinnamon modules(higher level) use `imports.ui.*.` For more documentation refer to /usr/share/cinnamon/js/ui

```
const PopupMenu = imports.ui.popupMenu; //High-level classes for building menus for applets or context menus
const Applet = imports.ui.applet; //Base applet classes
```

- to import other Cinnamon functionality use below. Import it via `imports.misc.*` :

```
const Util = imports.misc.util; //useful functions
const Interfaces = imports.misc.interfaces; //DBus stuff
```

<!-- TODO
 - to import xlet modules().
```

```-->

- `xlet` is an abbreviation to refer to extesnions, applets and desktlets as one entity
- to import xlet modules you can use :

```
const Module = imports.ui.appletManager['foo@bar'].module; // get module.js in your applet directory

const Module = imports.ui.deskletManager['foo@bar'].module; // get module.js in your desklet directory

const Module = imports.ui.extensionSystem['foo@bar'].module; // get module.js in your extension directory
```

- In cinnamon 3.6+(not compatible with earlier versions) we can also do it by:

```
const Module = imports.applets['foo@bar'].module;
const Module = imports.desklets['foo@bar'].module;
const Module = imports.extensions['foo@bar'].module;
```

# Structure

```
- UUID
----/info.json
----/screenshot.png
----/CHANGELOG.md
----/REAME.md
----/Files
    ----/UUID
        ----/metadata.json
        ----/LICENSE
        ----/extension.js
        ----/icon.png
        ----/po : directory i don't know the purpose of but i suppose it is for translation
```

- Note: `Files` directory must contain only one thing i.e `UUID` directory

## Purpose:

- info.json: contains
  - author :
  - license :
  - original_author :
- metadata.json : contains
  - uuid
  - name
  - version
  - description
  - url
  - website
  - icon
  - max-instances
  - cinnamon-version : (if specified extension.js moves into a folder with this cinnamon-version. For ex. if cinnamon-version was 6.0 extension.js would move into a folder called /UUID/Files/UUID/6.0)

# Coding Extensions

## Functions

## common javascript

- `.destroy()` and `new` : to create and destory dynamically created objects
- `function.bind(context)`: if the function calls `this` it will refer to context i.e `this = context`
- `object.bindProperty(direction,keyInSettings,valueInObject,callback)` : object is `bounded` to the settings of the extensions. i.e if there is a change in the settings or object it may be reflected on the other depending upon what `direction` is specified. For more details refer to [Settings](#settings)
- Most common js template is like below. Also see one way to create object in extensions:

```
// taken from workspace-scroller@ori
globalExtensionVar
function Extension(data) {
    this._init(data);
}

//called when extension is loaded
function init(dmetadata) {
    globalExtensionVar = new Extension(metadata);
}
function enable(){
    // called when extension is enabled
}
function disable(){
    // called when extension is disabled
}
Extension.prototype._init = function (xyz) {
    this.abc = xyz
}
Extension.prototype._someFunction = function (a,b,c) { //.. }
```

- can use math functionality like `Math.abs`

## Libraries

### Lang

### Global

```
global.log() //to print something; useful for debugging
global.get_current_time() // to get current time
global.screen.get_active_workspace_index() // to get the index of workspace currently active
global.screen.get_workspace_by_index(index) // to get the workspace by index
global.display //refers to everything on display and its events including multiple workspaces
    - id = global.display.connect("eventName",callback)
    - global.display.disconnect(eventId)
global.get_window_actors() : to get all the actors in the window i.e all windows
let [x,y,mods] = global.get_pointer()
```

### St

Used to make ui elements(or actors as is called in the documentation)

```
// taken from workspace-scroller@ori
this.button = new St.Button(); //to create a new button which can take inputs

    this.button.set_position(x + (dx < 0 ? dx : 0), y + (dy < 0 ? dy : 0)); //set position
    this.button.set_width(Math.abs(dx)); //set width and height
    this.button.set_height(Math.abs(dy));
    this.button.opacity = 0; //set opacity, = 0 means it is transparent
    this.button.connect('scroll-event', this.onScroll.bind(this)); //'scroll-event' is a Clutter event for scrolling see Clutter in this doc for more details
```

### Clutter

Used to handle events, animations etc.

```
//taken from workspace-scroller@ori
Area.prototype.onScroll = function (actor, event) {
    var scrollDirection = event.get_scroll_direction(); //to get event direction and compare it with a known Clutter event

    if (scrollDirection === Clutter.ScrollDirection.SMOOTH) {
        return Clutter.EVENT_PROPAGATE; //to let the event propagate to the windows in focus
    }

    let direction = scrollDirection,
        action = direction ? this.actionDown : this.actionUp;

    switch (action) {
        case Action.Left: this.slide(-1); break;
        case Action.Right: this.slide(1); break;
        case Action.Expo: this.showExpo(); break;
    }
}
```

```
actor.remove_effect_by_name("effectName") //to remove the effect by name from an actor
actor.add_effect_with_name("effectName",effect)
actor.get_effect("effectName")
```

```
effect
```

```
 _grabId = global.display.connect(
         "grab-op-begin",
         (display, screen, window, op) => {
             global.log("hey you are grabbing now");
             global.log("display is ", JSON.stringify(display));
             print("window is ", window);
             print("screen is ", screen);
             print("op is", op);
             print("display is same? ", global.display == display);
             print("screen is same? ", global.screen == screen);
         },
    );
     _ungrabId = global.display.connect("grab-op-end", () =>
         global.log("you are now NOT grabbing"),
    );
    global.display.disconnect(_grabId);
    global.display.disconnect(_ungrabId);
```

### Main

```
// taken from workspace-scroller@ori
const Main = imports.ui.main;
Main.layoutManager.addChrome(this.button, { visibleInFullscreen: true });
if (!Main.expo.animationInProgress) { // to check if expo animation is in progress
        Main.expo.show(); //to show workspace overview
}
let monitor = Main.layoutManager.primaryMonitor;
  //can use monitor.height and monitor.weight
Main.layoutManager.addChrome(this.button, { visibleInFullscreen: true }) //to add in layout one
Main.keybindingManager : to manage shortcuts
    - .removeHotKey(id)
    -
```

### Settings

```
// taken from workspace-scroller@ori
this.settings = new Settings.ExtensionSettings(this, uuid); // to get access to current extension settings
this.settings.bindProperty(Settings.BindingDirection.IN, key, value, onChange); // to bind properties in this.settings(i.e js object to track the changes in settings) by key and value
```

### Extension System

To see if multiple extensions are running or not and return the instance of the extension

```
// taken from workspace-scroller@ori
const ExtensionSystem = imports.ui.extensionSystem;
if (ExtensionSystem.runningExtensions.indexOf('extension1@randomAuthor') > -1 ) { //check if an extension is running or not
    extInstance = ExtensionSystem.extensions['extension@randomAuthor']['5.4']['extension']; // refer to the extesnion's instance
    if(typeof extInstance.something !== "function"){
        //..do some other thing
    }
}
```

# Help

## Debug

- METHOD 1: run on terminal the command `tail -f ~/.xsession-errors`
- METHOD 2(MORE RELIABLE) : on Panel -> Troubleshoot -> Looking Glass
    - to print use ```global.log```
    - if not getting output on Looking Glass, it means there is an error: use try-catch block and print e.message or e.trace for more info
    - use type of and instance of to get parent classes and properties


## Additional documentation

- can refer to multiple sources though some which will be more beneficial are mentioned below:
  - [gjs documentaion from bookmark]()
  - [Official Tutorial for Mint Applets,Desklets and Extensions](https://projects.linuxmint.com/reference/git/cinnamon-tutorials)
  - [Cinnamon-spices-extension or Desklets/Applets](https://github.com/linuxmint/cinnamon-spices-extensions)
  - go to /usr/share/cinnamon/js on your system
  - [cjs doc section](https://github.com/linuxmint/cjs/tree/master/doc)
  - Cinnamon Documentation
    - run the following commands
    ```
    sudo apt install cinnamon-doc
    sudo apt install devhelp
    devhelp
    ```
