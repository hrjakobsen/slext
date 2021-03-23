import "reflect-metadata";
import { Container } from "typedi";
import { Slext } from "./slext";
import { TabModule } from "./tabs";
import { Settings } from "./settings";
import { CommandPalette } from "./commandpalette/commandpalette";
import { ThemeModule } from "./theme";
import { EditorCommands } from "./editorcommands";
import { PageHook } from "./pagehook.service";
import { RemoveFlagsModule } from "./removeflags";
import { InvertPdfModule } from "./pdfinverter";
import { Utils } from "./utils";
import { Shortcut } from "./shortcut.service";

function projectLoaded(url) {
    return Utils.isShareLatex(url) || Utils.isOverleaf(url);
}

(function () {
    let i = setInterval(() => {
        if (projectLoaded(window.location.href)) {
            clearInterval(i);
            PageHook.initialize();
            let slext: Slext = Container.get(Slext);
            let interval = setInterval(() => {
                if (!slext.isLoaded()) return;
                clearInterval(interval);
                let settings: Settings = Container.get(Settings);
                let shortcut: Shortcut = Container.get(Shortcut);
                let theme: ThemeModule = Container.get(ThemeModule);
                let tabs = Container.get(TabModule);
                let search = Container.get(CommandPalette);
                let editorcommands = Container.get(EditorCommands);
                let removeFlags = Container.get(RemoveFlagsModule);
                let pdfinverter = Container.get(InvertPdfModule);
            }, 100);
        }
    }, 500);
})();
