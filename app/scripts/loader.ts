import 'reflect-metadata';
import { Container } from 'typedi';
import { Slext } from './slext';
import { TabModule } from './tabs';
import { Settings } from './settings';
import { Search } from './search';
import { ThemeModule } from './theme';
import { EditorCommands } from './editorcommands';
import { PageHook } from './pagehook.service';

(function () {
    PageHook.initialize();
    let slext: Slext = Container.get(Slext);
    let interval = setInterval(() => {
        if (!slext.isLoaded()) return;
        clearInterval(interval);
        let settings: Settings = Container.get(Settings);
        let theme: ThemeModule = Container.get(ThemeModule);
        let tabs = Container.get(TabModule);
        let search = Container.get(Search);
        let editorcommands = Container.get(EditorCommands);
    }, 100);
})();
