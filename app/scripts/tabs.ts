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
    private draggedtab: Tab = null;
    constructor(protected slext: Slext) {
        let self = this;
        this.setupListeners();
        this.addTabBar();
        this.addCompileMainButton();

        PersistenceService.load('tabs_openFiles', function (files: [any]) {
            if (!files) return;
            if (files.length < 1) return;
            let allfiles = self.slext.getFiles();
            files.forEach(file => {
                let fileMatch = allfiles.find(x => x.path == file.path);
                if (fileMatch == null) return;
                self.openTab(fileMatch, file.favorite);
            });

            PersistenceService.load('tabs_currentTab', function (path: string) {
                let tab = self._tabs.findIndex(x => x.file.path == path);
                if (tab != -1) tab = 0;
                self.currentFile = self._tabs[tab].file || null;
                self.selectTab(tab);
            });

            PersistenceService.load('tabs_mainTab', function (path: string) {
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
        PersistenceService.save(
            'tabs_openFiles',
            this._tabs.map(t => { return { path: t.file.path, favorite: t.favorite } })

        );

        PersistenceService.save(
            'tabs_currentTab',
            this._currentTab.file.path
        );

        if (this.maintab != null && this.maintab !== undefined) {
            PersistenceService.save(
                'tabs_mainTab',
                this.maintab.file.path
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

        $('html').on("click", ".slext-tabs__caret--next", function (evt) {
            let bar = $(".slext-tabs");
            bar.scrollLeft(bar.scrollLeft() + 100);
        });

        $('html').on("click", ".slext-tabs__caret--prev", function (evt) {
            let bar = $(".slext-tabs");
            bar.scrollLeft(Math.max(bar.scrollLeft() - 100, 0));
        });
    }

    private openTab(file: File, favorite?: boolean) {
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
        let t: Tab = { tab: el, file: file, favorite: false };
        if (favorite) this.setFavoriteTab(t);
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

    private dragstart(e: DragEvent) {
        this.draggedtab = $(e.srcElement).data('tab') as Tab;
        this.draggedtab.tab.addClass("slext-tabs__tab--dragged");
    }

    private dragenter(e: DragEvent) {
        $(e.target).parents('.slext-tabs__tab').addClass("slext-tabs__tab--hovered");
    }

    private dragleave(e: DragEvent) {
        $(e.target).parents('.slext-tabs__tab').removeClass("slext-tabs__tab--hovered");
    }

    private drop(e) {
        this.dragleave(e);
        e.preventDefault();
        let target = $(e.target).parents('.slext-tabs__tab').data('tab') as Tab;
        let indexTarget = this._tabs.indexOf(target);
        if (indexTarget == -1) {
            console.error("Could not find target tab as an open tab");
            return true;
        }
        let indexSrc = this._tabs.indexOf(this.draggedtab);
        if (indexSrc == -1) {
            console.error("Could not find source tab as an open tab");
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