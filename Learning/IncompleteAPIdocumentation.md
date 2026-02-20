# Introduction : Functions,properties etc for windows,metawindow etc that may be useful for this extension and where did it came from 

# Actor
## cinnamon.js.ui
### workspaceView.js
actor.set_size(0,0)
actor.set_position(x,y)
this.actor.add_actor(this._workspaces[i].actor);
        this._workspaces[activeWorkspaceIndex].actor.raise_top();
        global.stage.set_key_focus(this.actor);
let stack = global.get_window_actors()
// Use the stable sequence for an integer to use as a hash key
            stackIndices[stack[i].get_meta_window().get_stable_sequence()] = i;
  workspace.actor.visible = (w == active);
  workspace.actor.show()
this._workspaces[i].actor
workspace.actor.is_finalized()



# Workspace
let activeWorkspaceIndex = global.workspace_manager.get_active_workspace_index();
global.workspace_manager.n_workspaces;
let metaWorkspace = global.workspace_manager.get_workspace_by_index(i);
            this._workspaces[i] = new Workspace.Workspace(metaWorkspace, this);
            let metaWorkspace = this._workspaces[current].metaWorkspace;
            metaWorkspace.activate(global.get_current_time());

/usr/share/cinnamon/js/ui/workspacesView.js





# Monitor
        let primary = Main.layoutManager.primaryMonitor;







# Events
        let restackedNotifyId = global.display.connect('restacked', Lang.bind(this, this._onRestacked));
        let switchWorkspaceNotifyId = global.window_manager.connect('switch-workspace',
                                          Lang.bind(this, this._activeWorkspaceChanged));

        let nWorkspacesChangedId = global.workspace_manager.connect('notify::n-workspaces', Lang.bind(this, this._workspacesChanged));
      this.actor.connect('key-press-event', this._onStageKeyPress.bind(this));
        this.actor.connect('key-release-event', this._onStageKeyRelease.bind(this));
