import { Slext } from './slext';
import { Service, Container } from 'typedi';
import { File, FileUtils } from './file';
import * as $ from 'jquery';
import { Utils } from './utils';
import { PersistenceService } from './persistence.service';
import { setInterval } from 'timers';
import { Settings } from './settings';
import { Logger } from './logger';
import { NotificationService } from './notification.service';


interface Tab {
    file: File;
    tab: JQuery<HTMLElement>;
    favorite: boolean;
    temporary: boolean;
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
    private draggedtab: Tab = null;
    private temporarytab: Tab = null;
    private temporaryTabsEnabled: boolean;
    private mainTabFirst: boolean;
    private settings: Settings;

    constructor(protected slext: Slext) {
        let self = this;
        this.settings = Container.get(Settings);
        this.setupListeners();
        this.addTabBar();
        this.addCompileMainButton();

        PersistenceService.loadLocal('tabs_openFiles', function (files: [any]) {
            if (!files) return;
            if (files.length < 1) return;
            let allfiles = self.slext.getFiles();
            files.forEach(file => {
                let fileMatch = allfiles.find(x => x.path == file.path);
                if (fileMatch == null) return;
                self.openTab(fileMatch, file.favorite);
            });

            PersistenceService.loadLocal('tabs_currentTab', function (path: string) {
                let tab = self._tabs.findIndex(x => x.file.path == path);
                if (tab == -1) tab = 0;

                // If no tabs are open, we cannot do anything
                if (!self._tabs.length) return;


                self.currentFile = self._tabs[tab].file || null;

                self.selectTab(tab);
            });

            PersistenceService.loadLocal('tabs_mainTab', function (path: string) {
                let tab = self._tabs.findIndex(x => x.file.path == path);
                if (tab != -1) {
                    self.setMainTab(self._tabs[tab]);
                }
            });
        });

        window.onbeforeunload = () => this.saveTabs();

        setTimeout(() => this.ensureRightTab(), 2000);
        slext.addEventListener("editorChanged", () => this.ensureRightTab());
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
        PersistenceService.saveLocal(
            'tabs_openFiles',
            this._tabs.map(t => { return { path: t.file.path, favorite: t.favorite } })
        );

        PersistenceService.saveLocal(
            'tabs_currentTab',
            this._currentTab.file.path
        );

        if (this.maintab != null && this.maintab !== undefined) {
            PersistenceService.saveLocal(
                'tabs_mainTab',
                this.maintab.file.path
            );
        } else {
            PersistenceService.saveLocal(
                'tabs_mainTab',
                null
            );
        }
    }

    protected setupListeners() {
        let self = this;
        this.slext.addEventListener('FileSelected', (selectedFile: File) => {
            let index = self._tabs.findIndex(tab => {
                return tab.file.path === selectedFile.path;
            });

            if (index == -1) {
                // File is not already opened
                self.openTab(selectedFile, false, self.temporaryTabsEnabled);
            } else {
                // File is already open. Focus it instead
                self.selectTab(index);
            }
        });

        $('html').on('click', '.slext-tabs__tab', function (evt) {
            let clickedTab = $(this).data('tab') as Tab;
            Logger.debug("Clicked on ", clickedTab);
            if (!document.contains(clickedTab.file.handle) ||
                FileUtils.newFile(clickedTab.file.handle).path != clickedTab.file.path) {
                self.reindexTabs();
            }

            if (self._tabs.includes(clickedTab)) {
                $(clickedTab.file.handle).first().click();
            }
        });

        $(document).keydown(function (e) {
            if (e.altKey && e.which == 87) {
                self.closeTab(self._currentTab);
            } else if (e.altKey && e.which == 77) {
                self.setMainTab(self._currentTab);
            } else if (e.altKey && e.which == 68) {
                e.preventDefault();
                self.setFavoriteTab(self._currentTab);
            } else if (e.altKey && e.which == 13) {
                e.preventDefault();
                self.compileMain();
            } else if (!e.ctrlKey && e.altKey && (e.which >= 49 && e.which <= 57)) {
                e.preventDefault();
                // Subtract 48 to get the value of the number pressed on keyboard
                // 1 is 49, 9 is 57
                let tabNumber = e.which - 48;
                if (tabNumber == 9) tabNumber = self._tabs.length;
                if (tabNumber <= self._tabs.length) {
                    $(self._tabs[tabNumber - 1].file.handle).click();
                }
            }
        });

        $('html').on('click', '.slext-tabs__tab-cross', function (evt) {
            evt.stopPropagation();
            let tab = $(this)
                .parent()
                .data('tab') as Tab;
            self.closeTab(tab);
        });

        $('html').on("click", ".slext-tabs__caret--next", function (evt) {
            let bar = $(".slext-tabs");
            bar.scrollLeft(bar.scrollLeft() + 100);
        });

        $('html').on("click", ".slext-tabs__caret--prev", function (evt) {
            let bar = $(".slext-tabs");
            bar.scrollLeft(Math.max(bar.scrollLeft() - 100, 0));
        });

        PersistenceService.load("temporary_tabs", function (enabled) {
            self.temporaryTabsEnabled = enabled || false;
        });
        self.settings.addEventListener("temporary_tabsChanged", function (enabled) {
            self.temporaryTabsEnabled = enabled;
        });

        PersistenceService.load("main_tab_first", function (enabled) {
            self.mainTabFirst = enabled || false;
        });
        self.settings.addEventListener("main_tab_firstChanged", function (enabled) {
            self.mainTabFirst = enabled;
            if (self.mainTabFirst && self.maintab != null && self.maintab !== undefined) {
                let index = self._tabs.indexOf(self.maintab);
                self.moveTab(index, 0);
            }
        });

        self.slext.addEventListener("layoutChanged", function () {
            self.addCompileMainButton();
        });


        $('#ide-body').on('scroll', x => {
           $('#ide-body').scrollTop(0);
           console.log("scrolling");
        });

    }

    private reindexTabs() {
        this.slext.updateFiles();
        let filesRemoved: number = 0;
        for (let i = 0; i < this._tabs.length; i++) {
            let tab = this._tabs[i];
            let index = this.slext.getFiles().findIndex(f => f.path == tab.file.path);
            if (index == -1) {
                if (this.maintab == tab) this.setMainTab(tab);
                if (tab.favorite) this.setFavoriteTab(tab);
                if (this._tabs.length <= 1) this.ensureRightTab();
                this.closeTab(tab);
                filesRemoved++;
            } else {
                tab.file = this.slext.getFiles()[index];
            }
        }
        if (filesRemoved > 0) {
            NotificationService.warn(filesRemoved + " dead tabs was just closed.");
        }
    }

    private openTab(file: File, favorite?: boolean, temporary?: boolean) {
        //Check if file is already open
        if (this._tabs.filter(f => f.file.path == file.path).length) return;

        favorite = favorite || false;

        let el = $(Utils.format(TabModule.tabTemplate, file));
        el[0].ondragstart = (e) => this.dragstart(e);
        el[0].ondragenter = (e) => this.dragenter(e);
        el[0].ondragleave = (e) => this.dragleave(e);
        el[0].ondragover = (e) => e.preventDefault();
        el[0].ondrop = (e) => this.drop(e);
        el[0].ondragend = (e) => this.dragend(e);
        this.tabBar.find('.slext-tabs').append(el);
        let t: Tab = { tab: el, file: file, favorite: false, temporary: temporary || false };
        if (favorite) this.setFavoriteTab(t);
        el.data('tab', t);
        this._tabs.push(t);
        this.selectTab(this._tabs.length - 1);

        if (this.temporarytab) {
            this.closeTab(this.temporarytab);
            this.temporarytab = null;
        }

        if (t.temporary) {
            let self = this;

            this.temporarytab = t;
            t.tab.addClass("slext-tabs__tab--temporary");

            let editorListener, tabListener;

            let removeTemp = function (event) {
                //Ignore commands
                if (event.altKey || event.ctrlKey) return;

                if (self._currentTab == t) {
                    t.temporary = false;
                    self.temporarytab = null;
                    t.tab.removeClass("slext-tabs__tab--temporary");
                    editorListener.unbind();
                    tabListener.unbind();

                }
            };

            editorListener = $("#editor").on("keydown", function (e) {
                removeTemp(e);
            });

            tabListener = t.tab.on("dblclick", function (e) {
                removeTemp(e);
            });
        }

        let overlaps = this._tabs.filter(tab => tab.file.name == t.file.name);
        if (overlaps.length > 1) {
            this.fixOverlaps(overlaps);
        } 
    }

    private fixOverlaps(overlaps : Tab[]) {
        //Special case of removal tab that has overlaps
        if (overlaps.length == 1) {
            overlaps[0].tab.find('.slext-tabs__tab-name').text(overlaps[0].file.name);
            return;
        }

        let parts = overlaps.map(x => x.file.path.split('/'));

        while (this.matchesNLayers(parts, 2)) {
            for (let i = 0; i < parts.length; i++) {
                parts[i].splice(0, 1);
            }
        }

        for (let i = 0; i < parts.length; i++) {
            parts[i].splice(parts[i].length - 1, 1);
            overlaps[i].tab.find('.slext-tabs__tab-name').text(overlaps[i].file.name + " — " + parts[i].join('/'));
        }
    }

    private matchesNLayers(arrs, n) {
        for (let l = 0; l < n; l++) {
            let val = arrs[0][l];
            for (let i = 1; i < arrs.length; i++) {
                if (arrs[i][l] != val) {
                    return false;
                }
            }
        }
        return true;
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

    private compileMain() {
        let self = this;
        let fullscreen = self.slext.isFullScreenPDF();
        if (self.maintab == null || self.maintab === undefined) {
            alert("Select a main file first!");
            return;
        }
        let cur = self._currentTab;
        self.maintab.tab.click();
        setTimeout(() => {
            $("a[ng-click='recompile()']")[0].click();
            setTimeout(() => {
                cur.tab.click();
                if (fullscreen) {
                    setTimeout(() => {
                        self.slext.goToFullScreenPDF();
                    }, 500);
                }
            }, 500);
        }, 500);
    }

    protected addCompileMainButton() {
        //Check if button is already there
        if ($('.btn-compile-main').length > 0) {
            Logger.debug("Main button already present, no need to add it again");
            return;
        }

        let self = this;
        let compileMainButton = $(`
            <div class="btn-recompile-group btn-compile-main">
                <a class="btn btn-recompile" href>
                    <i class="fa fa-home"></i>
                    Compile main
                </a>
            </div>
        `);
        $(".btn-recompile-group").after(compileMainButton);
        compileMainButton.on('click', function () {
            self.compileMain();
        });
    }

    private closeTab(tab: Tab) {
        let overlaps = this._tabs.filter(t => t.file.name == tab.file.name && t != tab);
        if (overlaps.length > 0) {
            this.fixOverlaps(overlaps); 
        }

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
        if (tab == this.temporarytab) {
            this.temporarytab = null;
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
        if (this.mainTabFirst) {
            let tabIndex = this._tabs.indexOf(tab);
            this.moveTab(tabIndex, 0);
        }
    }

    private setFavoriteTab(tab: Tab) {
        tab.favorite = !tab.favorite;
        tab.tab.toggleClass('slext-tabs__tab--favorite');
    }

    private dragstart(e: DragEvent) {
        this.draggedtab = $(e.srcElement).data('tab') as Tab;
        this.draggedtab.tab.addClass("slext-tabs__tab--dragged");
    }

    private dragenter(e: DragEvent) {
        let el = $(e.target);
        if (!el.hasClass('slext-tabs__tab')) {
            el = el.parents('.slext-tabs__tab');
        }
        el.addClass("slext-tabs__tab--hovered");
    }

    private dragleave(e: DragEvent) {
        $(e.target).removeClass("slext-tabs__tab--hovered");
    }

    private drop(e) {
        this.dragleave(e);
        e.preventDefault();
        let el = $(e.target);
        if (!el.hasClass('slext-tabs__tab')) {
            el = el.parents('.slext-tabs__tab');
        }
        let target = el.data('tab') as Tab;

        //Tried to move maintab away
        if ((target == this.maintab || this.draggedtab == this.maintab) && this.mainTabFirst) return true;

        let indexTarget = this._tabs.indexOf(target);
        if (indexTarget == -1) {
            Logger.error("Could not find target tab as an open tab");
            return true;
        }
        let indexSrc = this._tabs.indexOf(this.draggedtab);
        if (indexSrc == -1) {
            Logger.error("Could not find source tab as an open tab");
            return true;
        }

        this.moveTab(indexSrc, indexTarget);

        return true;
    }

    private moveTab(src: number, target: number) {
        if (src == target) return; // No need to do anything
        let srcEl = this._tabs[src].tab;
        let targetEl = this._tabs[target].tab;

        if (src < target) {
            //We should place the src after the target
            this.arrmove(this._tabs, src, target);
            srcEl.insertAfter(targetEl);
        } else {
            //We should place the src before the target
            this.arrmove(this._tabs, src, target - 1);
            srcEl.insertBefore(targetEl);
        }
    }

    private arrmove(arr: Array<any>, src: number, target: number) {
        if (src == target) return;
        let element = arr[src];
        if (src < target) target--;
        arr.splice(src, 1);
        arr.splice(target + 1, 0, element);
    }

    private dragend(e) {
        this.draggedtab.tab.removeClass("slext-tabs__tab--dragged");
        this.draggedtab = null;
    }
}
