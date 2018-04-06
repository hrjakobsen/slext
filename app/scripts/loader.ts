import 'reflect-metadata';
import { Container } from 'typedi';
import { Slext } from './slext';
import { TabModule } from './tabs';
import { Settings } from './settings';
import { Search } from './search';
import { ThemeModule } from './theme';
import { EditorCommands } from './editorcommands';
import { PageHook } from './pagehook.service';
import { RemoveFlagsModule } from './removeflags';

function projectLoaded(url) {
    return /^.*sharelatex\.com\/project\/\S+$/.test(url)
        || /^.*sharelatex\.com\/read\/\S+$/.test(window.location.href)
        || /^.*sharelatex\.com\/[0-9]{10}[a-z]{12}$/.test(window.location.href);
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
                let theme: ThemeModule = Container.get(ThemeModule);
                let tabs = Container.get(TabModule);
                let search = Container.get(Search);
                let editorcommands = Container.get(EditorCommands);
                let removeFlags = Container.get(RemoveFlagsModule);
            }, 100);
        }
    }, 500);

})();
