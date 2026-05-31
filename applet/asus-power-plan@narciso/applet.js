const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const St = imports.gi.St;
const Main = imports.ui.main;
const Settings = imports.ui.settings;
const Util = imports.misc.util;
const Lang = imports.lang;

const APPLET_DIR = imports.ui.appletManager.appletMeta["asus-power-plan@narciso"].path;

function MyApplet(metadata, orientation, panelHeight, instanceId) {
    this._init(metadata, orientation, panelHeight, instanceId);
}

MyApplet.prototype = {
    __proto__: Applet.IconApplet.prototype,

    _init: function(metadata, orientation, panelHeight, instanceId) {
        Applet.IconApplet.prototype._init.call(this, orientation, panelHeight, instanceId);
        this.set_applet_icon_name("computer");
        this.set_applet_tooltip("Power Plan: Balanced");

        this.profiles = {
            "performance": { label: "Performance", stapm: 15000, fast: 30000, slow: 25000, icon: "high" },
            "balanced":   { label: "Balanced",   stapm: 12000, fast: 18000, slow: 15000, icon: "medium" },
            "powersaver": { label: "Power Saver", stapm: 8000,  fast: 12000, slow: 10000, icon: "low" }
        };
        this.keys = ["performance", "balanced", "powersaver"];
        this.current = "balanced";
        this.menu = null;

        this.settings = new Settings.AppletSettings(this, "asus-power-plan@narciso", instanceId);
        this.settings.bindProperty(Settings.BindingDirection.IN, "custom-profiles", "custom_profiles", function() {
            this._rebuild();
        });

        this._apply(this.current);
        this._build_menu();
    },

    _apply: function(key) {
        let p = this.profiles[key];
        if (!p) return;
        let args = "--stapm-limit=" + p.stapm + " --fast-limit=" + p.fast + " --slow-limit=" + p.slow;
        GLib.spawn_command_line_async("sudo /usr/local/bin/ryzenadj " + args);
        this.current = key;
        this.set_applet_tooltip("Power Plan: " + p.label);

        let iconPath = APPLET_DIR + "/" + p.icon + ".png";
        let icon = new Gio.FileIcon({ file: Gio.File.new_for_path(iconPath) });
        try {
            this.set_applet_icon(icon);
        } catch(e) {
            this.set_applet_icon_name("computer");
        }
    },

    _build_menu: function() {
        if (this.menu) this.menu.destroy();
        this.menu = new Applet.AppletPopupMenu(this, null);

        for (let i = 0; i < this.keys.length; i++) {
            let key = this.keys[i];
            let p = this.profiles[key];
            let item = new PopupMenu.PopupMenuItem(p.label);
            if (key === this.current) {
                item.setSensitive(false);
            }
            item.connect("activate", Lang.bind(this, function() {
                this._apply(key);
                this._build_menu();
            }));
            this.menu.addMenuItem(item);
        }

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        let settings = new PopupMenu.PopupMenuItem("Settings");
        settings.connect("activate", Lang.bind(this, function() {
            Util.spawnCommandLine("cinnamon-settings applets " + this.instance_id);
        }));
        this.menu.addMenuItem(settings);
    },

    on_applet_clicked: function(event) {
        let idx = this.keys.indexOf(this.current);
        let next = this.keys[(idx + 1) % this.keys.length];
        this._apply(next);
        this._build_menu();
    },

    on_applet_clicked_right_click: function(event) {
        this._build_menu();
        this.menu.toggle();
    },

    _rebuild: function() {
        if (this.custom_profiles && this.custom_profiles.length > 0) {
            this.profiles = {};
            this.keys = [];
            for (let i = 0; i < this.custom_profiles.length; i++) {
                let p = this.custom_profiles[i];
                if (p.key && p.label && p.stapm && p.fast && p.slow) {
                    this.profiles[p.key] = {
                        label: p.label,
                        stapm: parseInt(p.stapm),
                        fast: parseInt(p.fast),
                        slow: parseInt(p.slow),
                        icon: p.icon || "medium"
                    };
                    this.keys.push(p.key);
                }
            }
            if (this.keys.length === 0) this._reset_defaults();
            if (this.keys.indexOf(this.current) < 0) this.current = this.keys[0];
        } else {
            this._reset_defaults();
        }
        this._apply(this.current);
        this._build_menu();
    },

    _reset_defaults: function() {
        this.profiles = {
            "performance": { label: "Performance", stapm: 15000, fast: 30000, slow: 25000, icon: "high" },
            "balanced":   { label: "Balanced",   stapm: 12000, fast: 18000, slow: 15000, icon: "medium" },
            "powersaver": { label: "Power Saver", stapm: 8000,  fast: 12000, slow: 10000, icon: "low" }
        };
        this.keys = ["performance", "balanced", "powersaver"];
        this.current = "balanced";
    }
};

function main(metadata, orientation, panelHeight, instanceId) {
    return new MyApplet(metadata, orientation, panelHeight, instanceId);
}
