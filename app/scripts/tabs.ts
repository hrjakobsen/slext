import { Slext } from "./slext";
import { Service, Container } from "typedi";
import { File } from "./file";
import * as $ from "jquery";
import { Utils } from "./utils";
import { PersistenceService } from "./persistence.service";
import { Settings } from "./settings";
import { Logger } from "./logger";
import { NotificationService } from "./notification.service";
import { Shortcut } from "./shortcut.service";

interface Tab {
    file: File;
    tab: JQuery<HTMLElement>;
    favorite: boolean;
    temporary: boolean;
}

@Service()
export class TabModule {
    private static tabsTemplate: string = require("../templates/tabs.html");
    private static tabTemplate: string = require("../templates/tab.html");
    protected _tabs: Tab[] = [];
    protected _currentTab: Tab;
    protected _previousTab: Tab;
    protected tabBar: JQuery<HTMLElement>;
    private currentFile: File = null;
    private maintab: Tab = null;
    private draggedtab: Tab = null;
    private temporarytab: Tab = null;
    private temporaryTabsEnabled: boolean;
    private mainTabFirst: boolean;
    private settings: Settings;
    private shortcut: Shortcut;

    constructor(protected slext: Slext) {
        this.settings = Container.get(Settings);
        this.shortcut = Container.get(Shortcut);
        this.setupListeners();
        this.addTabBar();
        this.addCompileMainButton();

        PersistenceService.loadLocal("tabs_openFiles", (files: [any]) => {
            if (!files) return;
            if (files.length < 1) return;
            const allfiles = this.slext.getFiles();
            files.forEach((file) => {
                const fileMatch = allfiles.find((x) => x.path == file.path);
                if (fileMatch == null) return;
                this.openTab(fileMatch, file.favorite);
            });

            PersistenceService.loadLocal("tabs_currentTab", (path: string) => {
                let tab = this._tabs.findIndex((x) => x.file.path == path);
                if (tab == -1) tab = 0;

                // If no tabs are open, we cannot do anything
                if (!this._tabs.length) return;

                this.currentFile = this._tabs[tab].file || null;

                this.selectTab(tab);
            });

            PersistenceService.loadLocal("tabs_mainTab", (path: string) => {
                const tab = this._tabs.findIndex((x) => x.file.path == path);
                if (tab != -1) {
                    this.setMainTab(this._tabs[tab]);
                }
            });

            this._previousTab = null;
        });

        window.onbeforeunload = () => this.saveTabs();

        setTimeout(() => this.ensureRightTab(), 2000);
        slext.addEventListener("editorChanged", () => this.ensureRightTab());
    }

    protected ensureRightTab(): void {
        this.slext
            .currentFile()
            .then((curFile: File) => {
                if (curFile.type != "doc") {
                    this.currentFile = null;
                    this._currentTab = null;
                    this._currentTab.tab.removeClass("slext-tabs__tab--active");
                }

                if (this.currentFile == null || curFile.path != this.currentFile.path) {
                    const index = this._tabs.findIndex((f) => f.file.path == curFile.path);
                    if (index != -1) {
                        this.selectTab(index);
                    } else {
                        this.openTab(curFile);
                    }
                    this.currentFile = curFile;
                }
            })
            .catch((_err) => {
                // No file
                this._currentTab.tab.removeClass("slext-tabs__tab--active");
                this._currentTab = null;
                this.currentFile = null;
            });
    }

    protected saveTabs(): void {
        PersistenceService.saveLocal(
            "tabs_openFiles",
            this._tabs.map((t) => {
                return { path: t.file.path, favorite: t.favorite };
            })
        );

        PersistenceService.saveLocal("tabs_currentTab", this._currentTab.file.path);

        if (this.maintab != null && this.maintab !== undefined) {
            PersistenceService.saveLocal("tabs_mainTab", this.maintab.file.path);
        } else {
            PersistenceService.saveLocal("tabs_mainTab", null);
        }
    }

    protected setupListeners(): void {
        this.slext.addEventListener("FileSelected", (selectedFile: File) => {
            if (selectedFile == null) {
                return;
            }
            const index = this._tabs.findIndex((tab) => {
                return tab.file.path === selectedFile.path;
            });

            if (index == -1) {
                // File is not already opened
                this.openTab(selectedFile, false, this.temporaryTabsEnabled);
            } else {
                // File is already open. Focus it instead
                this.selectTab(index);
            }
        });

        $("html").on("click", ".slext-tabs__tab", (e) => {
            if (this.slext.isHistoryOpen()) {
                // Clicking the original files while history is open can mess up the editor
                NotificationService.warn(
                    "Tabs cannot be used while history is open. Close history panel and try again."
                );
                return;
            }
            const clickedTab = $(e.currentTarget).data("tab") as Tab;
            Logger.debug("Clicked on ", clickedTab);
            //Check if tab is "up to date"
            if (
                this.slext
                    .getFiles()
                    .filter((x) => x.id == clickedTab.file.id)
                    .filter((x) => x.path == clickedTab.file.path).length == 0
            ) {
                this.reindexTabs().then(() => {
                    if (this._tabs.includes(clickedTab)) {
                        this.slext.selectFile(clickedTab.file);
                    }
                });
            } else {
                if (this._tabs.includes(clickedTab)) {
                    this.slext.selectFile(clickedTab.file);
                }
            }
        });

        $("html").on("auxclick", ".slext-tabs__tab", (e) => {
            const clickedTab = $(e.currentTarget).data("tab") as Tab;
            Logger.debug("Middle click on", clickedTab);
            this.closeTab(clickedTab);
        });

        this.shortcut.addEventListener("Meta+W", (e) => {
            this.closeTab(this._currentTab);
            e.preventDefault();
        });
        this.shortcut.addEventListener("Meta+M", (e) => {
            this.setMainTab(this._currentTab);
            e.preventDefault();
        });
        this.shortcut.addEventListener("Meta+D", (e) => {
            this.setFavoriteTab(this._currentTab);
            e.preventDefault();
        });
        this.shortcut.addEventListener("Meta+Enter", (e) => {
            this.compileMain();
            e.preventDefault();
        });

        const goToTab = (e) => {
            // Subtract 48 to get the value of the number pressed on keyboard
            // 1 is 49, 9 is 57
            // Also constrain the range to be between 1 and the number of open tabs
            const tabNumber = Math.max(0, Math.min(this._tabs.length, e.which - 48));
            const tabIndex = tabNumber - 1;
            this.slext.selectFile(this._tabs[tabIndex].file);
            e.preventDefault();
        };

        this.shortcut.addEventListener("Meta+1", goToTab);
        this.shortcut.addEventListener("Meta+2", goToTab);
        this.shortcut.addEventListener("Meta+3", goToTab);
        this.shortcut.addEventListener("Meta+4", goToTab);
        this.shortcut.addEventListener("Meta+5", goToTab);
        this.shortcut.addEventListener("Meta+6", goToTab);
        this.shortcut.addEventListener("Meta+7", goToTab);
        this.shortcut.addEventListener("Meta+8", goToTab);
        this.shortcut.addEventListener("Meta+9", goToTab);

        const goToPreviousTab = (e) => {
            if (this._previousTab) this.slext.selectFile(this._previousTab.file);
            e.preventDefault();
        };

        this.shortcut.addEventListener("Meta+B", goToPreviousTab);

        $("html").on("click", ".slext-tabs__tab-cross", (e) => {
            e.stopPropagation();
            const tab = $(e.currentTarget).parent().data("tab") as Tab;
            this.closeTab(tab);
        });

        $("html").on("click", ".slext-tabs__caret--next", function (_e) {
            const bar = $(".slext-tabs");
            bar.scrollLeft(bar.scrollLeft() + 100);
        });

        $("html").on("click", ".slext-tabs__caret--prev", function (_e) {
            const bar = $(".slext-tabs");
            bar.scrollLeft(Math.max(bar.scrollLeft() - 100, 0));
        });

        PersistenceService.load("temporary_tabs", (enabled) => {
            this.temporaryTabsEnabled = enabled || false;
        });
        this.settings.addEventListener("temporary_tabsChanged", (enabled) => {
            this.temporaryTabsEnabled = enabled;
        });

        PersistenceService.load("main_tab_first", (enabled) => {
            this.mainTabFirst = enabled || false;
        });
        this.settings.addEventListener("main_tab_firstChanged", (enabled) => {
            this.mainTabFirst = enabled;
            if (this.mainTabFirst && this.maintab != null && this.maintab !== undefined) {
                const index = this._tabs.indexOf(this.maintab);
                this.moveTab(index, 0);
            }
        });

        this.slext.addEventListener("layoutChanged", () => {
            this.addCompileMainButton();
        });

        $("#ide-body").on("scroll", (_x) => {
            $("#ide-body").scrollTop(0);
        });
    }

    private reindexTabs(): Promise<void> {
        return this.slext.updateFiles().then(() => {
            let filesRemoved = 0;
            for (let i = 0; i < this._tabs.length; i++) {
                const tab = this._tabs[i];
                const index = this.slext.getFiles().findIndex((f) => f.path == tab.file.path);
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
                NotificationService.warn(
                    filesRemoved + " dead tab" + filesRemoved.length == 1 ? " was" : "s were" + " just closed."
                );
            }
        });
    }

    private openTab(file: File, favorite?: boolean, temporary?: boolean): void {
        //Check if file is already open
        if (this._tabs.filter((f) => f.file.path == file.path).length) return;

        favorite = favorite || false;

        const el = $(Utils.format(TabModule.tabTemplate, file));
        el[0].ondragstart = (e) => this.dragstart(e);
        el[0].ondragenter = (e) => this.dragenter(e);
        el[0].ondragleave = (e) => this.dragleave(e);
        el[0].ondragover = (e) => e.preventDefault();
        el[0].ondrop = (e) => this.drop(e);
        el[0].ondragend = (e) => this.dragend(e);
        this.tabBar.find(".slext-tabs").append(el);
        const t: Tab = {
            tab: el,
            file: file,
            favorite: false,
            temporary: temporary || false,
        };
        if (favorite) this.setFavoriteTab(t);
        el.data("tab", t);
        this._tabs.push(t);
        this.selectTab(this._tabs.length - 1);

        if (this.temporarytab) {
            this.closeTab(this.temporarytab);
            this.temporarytab = null;
        }

        if (t.temporary) {
            this.temporarytab = t;
            t.tab.addClass("slext-tabs__tab--temporary");

            const removeTemp = (event) => {
                //Ignore commands
                if (event.altKey || event.ctrlKey) return;

                if (this._currentTab == t) {
                    t.temporary = false;
                    this.temporarytab = null;
                    t.tab.removeClass("slext-tabs__tab--temporary");
                    editorListener.unbind();
                    tabListener.unbind();
                }
            };

            const editorListener = $("#editor").on("keydown", (e) => {
                removeTemp(e);
            });

            const tabListener = t.tab.on("dblclick", (e) => {
                removeTemp(e);
            });
        }

        const overlaps = this._tabs.filter((tab) => tab.file.name == t.file.name);
        if (overlaps.length > 1) {
            this.fixOverlaps(overlaps);
        }
    }

    private fixOverlaps(overlaps: Tab[]): void {
        //Special case of removal tab that has overlaps
        if (overlaps.length == 1) {
            overlaps[0].tab.find(".slext-tabs__tab-name").text(overlaps[0].file.name);
            return;
        }

        const parts = overlaps.map((x) => x.file.path.split("/"));

        while (this.matchesNLayers(parts, 2)) {
            for (let i = 0; i < parts.length; i++) {
                parts[i].splice(0, 1);
            }
        }

        for (let i = 0; i < parts.length; i++) {
            parts[i].splice(parts[i].length - 1, 1);
            overlaps[i].tab.find(".slext-tabs__tab-name").text(overlaps[i].file.name + " — " + parts[i].join("/"));
        }
    }

    private matchesNLayers(arrs, n): boolean {
        for (let l = 0; l < n; l++) {
            const val = arrs[0][l];
            for (let i = 1; i < arrs.length; i++) {
                if (arrs[i][l] != val) {
                    return false;
                }
            }
        }
        return true;
    }

    private selectTab(index: number): void {
        if (this._currentTab) this._currentTab.tab.removeClass("slext-tabs__tab--active");
        if (this._currentTab != this._tabs[index]) this._previousTab = this._currentTab;
        this._currentTab = this._tabs[index];
        if (this._currentTab) this._currentTab.tab.addClass("slext-tabs__tab--active");
    }

    protected addTabBar(): void {
        this.tabBar = $(TabModule.tabsTemplate);
        $("header.toolbar").after(this.tabBar);
        $("header.toolbar").addClass("toolbar-tabs");
        $("#ide-body").addClass("ide-tabs");
    }

    private compileMain(): void {
        const fullscreen = this.slext.isFullScreenPDF();
        if (this.maintab == null || this.maintab === undefined) {
            alert("Select a main file first!");
            return;
        }
        const cur = this._currentTab;
        this.maintab.tab.click();
        setTimeout(() => {
            $("#text-recompile").parent().click();
            setTimeout(() => {
                cur.tab.click();
                if (fullscreen) {
                    setTimeout(() => {
                        this.slext.goToFullScreenPDF();
                    }, 500);
                }
            }, 500);
        }, 500);
    }

    protected addCompileMainButton(): void {
        //Check if button is already there
        if ($(".btn-compile-main").length > 0) {
            Logger.debug("Main button already present, no need to add it again");
            return;
        }

        const compileMainButton = $(`
            <div class="btn-recompile-group btn-compile-main">
                <a class="btn btn-recompile" href>
                    <i class="fa fa-home"></i>
                    Compile main
                </a>
            </div>
        `);
        $(".btn-recompile-group").after(compileMainButton);
        compileMainButton.on("click", () => {
            this.compileMain();
        });
    }

    private closeTab(tab: Tab): void {
        const overlaps = this._tabs.filter((t) => t.file.name == tab.file.name && t != tab);
        if (overlaps.length > 0) {
            this.fixOverlaps(overlaps);
        }

        if (tab.favorite || tab == this.maintab) return;
        if (tab == this._currentTab) {
            //Need to select new tab

            //If only one tab open, we cannot close it
            if (this._tabs.length == 1) return;

            const index = this._tabs.indexOf(tab);
            const newIndex = Math.max(0, index - 1);

            this._tabs[index].tab.remove();
            this._tabs.splice(index, 1);

            this.selectTab(newIndex);
            this._currentTab.tab.click();
        } else {
            const index = this._tabs.indexOf(tab);
            this._tabs.splice(index, 1);
            tab.tab.remove();
        }
        if (tab == this._previousTab) {
            this._previousTab = null;
        }
        if (tab == this.temporarytab) {
            this.temporarytab = null;
        }
    }

    private setMainTab(tab: Tab): void {
        if (this.maintab == tab) {
            this.maintab.tab.removeClass("slext-tabs__tab--main");
            this.maintab = null;
            return;
        }
        if (this.maintab != null) {
            this.maintab.tab.removeClass("slext-tabs__tab--main");
        }
        this.maintab = tab;
        this.maintab.tab.addClass("slext-tabs__tab--main");
        if (this.mainTabFirst) {
            const tabIndex = this._tabs.indexOf(tab);
            this.moveTab(tabIndex, 0);
        }
    }

    private setFavoriteTab(tab: Tab): void {
        tab.favorite = !tab.favorite;
        tab.tab.toggleClass("slext-tabs__tab--favorite");
    }

    private dragstart(e: DragEvent): void {
        this.draggedtab = $(e.currentTarget).data("tab") as Tab;
        this.draggedtab.tab.addClass("slext-tabs__tab--dragged");
    }

    private dragenter(e: DragEvent): void {
        let el = $(e.currentTarget);
        if (!el.hasClass("slext-tabs__tab")) {
            el = el.parents(".slext-tabs__tab");
        }
        el.addClass("slext-tabs__tab--hovered");
    }

    private dragleave(e: DragEvent): void {
        $(e.currentTarget).removeClass("slext-tabs__tab--hovered");
    }

    private drop(e: DragEvent): boolean {
        this.dragleave(e);
        e.preventDefault();
        let el = $(e.currentTarget);
        if (!el.hasClass("slext-tabs__tab")) {
            el = el.parents(".slext-tabs__tab");
        }
        const target = el.data("tab") as Tab;

        //Tried to move maintab away
        if ((target == this.maintab || this.draggedtab == this.maintab) && this.mainTabFirst) return true;

        const indexTarget = this._tabs.indexOf(target);
        if (indexTarget == -1) {
            Logger.error("Could not find target tab as an open tab");
            return true;
        }
        const indexSrc = this._tabs.indexOf(this.draggedtab);
        if (indexSrc == -1) {
            Logger.error("Could not find source tab as an open tab");
            return true;
        }

        this.moveTab(indexSrc, indexTarget);

        return true;
    }

    private moveTab(src: number, target: number): void {
        if (src == target) return; // No need to do anything
        const srcEl = this._tabs[src].tab;
        const targetEl = this._tabs[target].tab;

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

    private arrmove(arr: Array<any>, src: number, target: number): void {
        if (src == target) return;
        const element = arr[src];
        if (src < target) target--;
        arr.splice(src, 1);
        arr.splice(target + 1, 0, element);
    }

    private dragend(_e): void {
        this.draggedtab.tab.removeClass("slext-tabs__tab--dragged");
        this.draggedtab = null;
    }
}
