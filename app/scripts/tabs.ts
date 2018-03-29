import { Slext } from './slext';
import { Service } from 'typedi';
import { File } from './file';
import * as $ from 'jquery';
import { Utils } from './utils';
import { PersistenceService } from './persistence.service';
import { setInterval } from 'timers';

interface Tab {
    file: File;
    tab: JQuery<HTMLElement>;
    favorite: boolean;
}

@Service()
export class TabModule {
    private static tabsTemplate: string = require('../templates/tabs.html');
    private static tabTemplate: string = require('../templates/tab.html');
    protected _tabs: Tab[] = [];
    protected _currentTab: Tab;
    protected tabBar: JQuery<HTMLElement>;
    private currentFile: File = null;
    private maintab: Tab = null;
    constructor(protected slext: Slext) {
        let self = this;
        this.setupListeners();
        this.addTabBar();
        this.addCompileMainButton();

        PersistenceService.load('tabs_openFiles', function (files: string[]) {
            if (!files) return;
            if (files.length < 1) return;
            let allfiles = self.slext.getFiles();
            files.forEach(file => {
                let fileMatch = allfiles.find(x => x.path == file);
                if (fileMatch == null) return;
                self.openTab(fileMatch);
            });

            PersistenceService.load('tabs_currentTab', function (path: string) {
                let tab = self._tabs.findIndex(x => x.file.path == path);
                if (tab != -1) tab = 0;
                self.currentFile = self._tabs[tab].file || null;
                self.selectTab(tab);
            });
        });

        $(window).on('unload', () => this.saveTabs());

        setInterval(() => this.ensureRightTab(), 5000);
    }

    protected ensureRightTab() {
        let curFile = this.slext.currentFile();
        if (curFile == null) return;
        if (this.currentFile == null || curFile.path != this.currentFile.path) {
            let index = this._tabs.findIndex(f => f.file.path == curFile.path);
            if (index != -1) {
                this.selectTab(index);
            } else {
                this.openTab(curFile);
            }
            this.currentFile = curFile;
        }
    }

    protected saveTabs() {
        PersistenceService.save(
            'tabs_openFiles',
            this._tabs.map(t => t.file.path),
            null
        );

        PersistenceService.save(
            'tabs_currentTab',
            this._currentTab.file.path,
            null
        );
    }

    protected setupListeners() {
        let self = this;
        this.slext.addEventListener('FileSelected', (selectedFile: File) => {
            let index = self._tabs.findIndex(tab => {
                return tab.file.path === selectedFile.path;
            });

            if (index == -1) {
                // File is not already opened
                self.openTab(selectedFile);
            } else {
                // File is already open. Focus it instead
                self.selectTab(index);
            }
        });

        $('html').on('click', '.slext-tabs__tab', function (evt) {
            let clickedTab = $(this).data('tab') as Tab;
            $(clickedTab.file.handle)[0].click();
        });

        $(document).keydown(function (e) {
            if (e.altKey && e.which == 87) {
                self.closeTab(self._currentTab);
            } else if (e.altKey && e.which == 77) {
                self.setMainTab(self._currentTab);
            } else if (e.altKey && e.which == 68) {
                e.preventDefault();
                self.setFavoriteTab(self._currentTab);
            }
        });

        $('html').on('click', '.slext-tabs__tab-cross', function (evt) {
            evt.stopPropagation();
            let tab = $(this)
                .parent()
                .data('tab') as Tab;
            self.closeTab(tab);
        });
    }

    private openTab(file: File) {
        let el = $(Utils.format(TabModule.tabTemplate, file));
        this.tabBar.append(el);
        let t = { tab: el, file: file, favorite: false };
        el.data('tab', t);
        this._tabs.push(t);
        this.selectTab(this._tabs.length - 1);
    }

    private selectTab(index: number) {
        if (this._currentTab)
            this._currentTab.tab.removeClass('slext-tabs__tab--active');
        this._currentTab = this._tabs[index];
        if (this._currentTab)
            this._currentTab.tab.addClass('slext-tabs__tab--active');
    }

    protected addTabBar() {
        this.tabBar = $(TabModule.tabsTemplate);
        $('header.toolbar').append(this.tabBar);
        $('header.toolbar').addClass('toolbar-tabs');
        $('#ide-body').addClass('ide-tabs');
    }

    protected addCompileMainButton() {
        let self = this;
        let compileMainButton = $(`
            <div class="btn-recompile-group btn-compile-main">
                <a class="btn btn-recompile" href>
                    <i class="fa fa-home"></i>
                    Compile main
                </a>
            </div>
        `)
        $(".btn-recompile-group").after(compileMainButton);
        compileMainButton.on('click', function () {
            if (self.maintab == null || self.maintab === undefined) {
                alert("Select a main file first!");
                return;
            }
            let cur = self._currentTab;
            self.maintab.tab.click();
            setInterval(() => {
                $(".btn-recompile").click();
                setInterval(() => {
                    cur.tab.click();
                }, 1000);
            }, 1000);
        });
    }

    private closeTab(tab: Tab) {
        if (tab.favorite || tab == this.maintab) return;
        if (tab == this._currentTab) {
            //Need to select new tab

            //If only one tab open, we cannot close it
            if (this._tabs.length == 1) return;

            let index = this._tabs.indexOf(tab);
            let newIndex = Math.max(0, index - 1);

            this._tabs[index].tab.remove();
            this._tabs.splice(index, 1);

            this.selectTab(newIndex);
            this._currentTab.tab.click();
        } else {
            let index = this._tabs.indexOf(tab);
            this._tabs.splice(index, 1);
            tab.tab.remove();
        }
    }

    private setMainTab(tab: Tab) {
        if (this.maintab == tab) {
            this.maintab.tab.removeClass('slext-tabs__tab--main');
            this.maintab = null;
            return;
        }
        if (this.maintab != null) {
            this.maintab.tab.removeClass('slext-tabs__tab--main');
        }
        this.maintab = tab;
        this.maintab.tab.addClass('slext-tabs__tab--main');
    }

    private setFavoriteTab(tab: Tab) {
        tab.favorite = !tab.favorite;
        tab.tab.toggleClass('slext-tabs__tab--favorite');
    }
}
