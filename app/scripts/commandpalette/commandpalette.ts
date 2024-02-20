import { Slext } from "../slext";
import { Service, Container } from "typedi";
import * as $ from "jquery";
import { Utils } from "../utils";
import { PersistenceService } from "../persistence.service";
import { FileBackend } from "./filebackend";
import { CommandBackend } from "./commandbackend";
import { Settings } from "../settings";
import { Shortcut } from "../shortcut.service";

export interface CommandItem {
    type: string;
    description: string;
    name: string;
    data: any;
}

export interface CommandPaletteBackend {
    selected(item: CommandItem): void;
    getItems(filter: string): CommandItem[];
    getPrefix(): string;
}

@Service()
export class CommandPalette {
    private static box: string = require("../../templates/searchbox.html");
    private static result: string = require("../../templates/searchresult.html");
    private prefixRequired: boolean;
    box: JQuery<HTMLElement>;
    resultlist: JQuery<HTMLElement>;
    active = false;
    currentSelected = -1;
    private backends: CommandPaletteBackend[];
    private settings: Settings;
    private shortcut: Shortcut;

    constructor(private slext: Slext) {
        this.backends = [Container.get(FileBackend), Container.get(CommandBackend)];
        this.settings = Container.get(Settings);
        this.shortcut = Container.get(Shortcut);
        this.box = $(CommandPalette.box);
        this.resultlist = this.box.children(".searchbox__results");
        $("body").append(this.box);

        PersistenceService.load("command_prefix", (r: boolean) => (this.prefixRequired = r || false));
        this.settings.addEventListener("command_prefixChanged", (r: boolean) => (this.prefixRequired = r || false));

        this.shortcut.addEventListener("Meta+P", (e) => {
            this.box.toggleClass("searchbox--active");
            this.active = !this.active;
            if (this.active) {
                this.box.children(".searchbox__field").focus();
                this.box.children(".searchbox__field").select();
            }
            e.preventDefault();
        });

        $(document).on("keydown", (e) => {
            if (e.which == 27) {
                // esc
                this.close();
                e.preventDefault();
            }
        });

        this.box.on("keydown", ".searchbox__field", (e) => {
            if (e.which == 13) {
                // enter
                this.selectFile();
                e.preventDefault();
            }
            if (e.which == 38) {
                // up
                this.select(this.currentSelected - 1);
                e.preventDefault();
            }
            if (e.which == 40) {
                // down
                this.select(this.currentSelected + 1);
                e.preventDefault();
            }
        });

        this.box.on("input", ".searchbox__field", (e) => {
            const inputfield = $(e.currentTarget);
            const text = inputfield.val() as string;

            let backendsToSearch = this.backends;

            if (this.prefixRequired) {
                backendsToSearch = backendsToSearch.filter((backend) => {
                    if (text.length == 0) {
                        return backend.getPrefix() == null;
                    }
                    return (
                        backend.getPrefix() == null || backend.getPrefix() == text.slice(0, backend.getPrefix().length)
                    );
                });
            }

            this.resultlist.empty();

            backendsToSearch.forEach((backend) => {
                if (this.resultlist.children().length >= 5) return;
                this.resultlist.append(
                    this.createList(backend, backend.getItems(text)).slice(0, 5 - this.resultlist.children().length)
                );
            });

            if (this.resultlist.children().length > 0) {
                this.select(0);
            }
        });
    }

    private close() {
        this.active = false;
        this.box.removeClass("searchbox--active");
        this.slext.focusEditor();
    }

    private selectFile() {
        const selected = $(".searchbox__resultitem--selected");

        // Check that search result was selected
        if (selected.length) {
            this.resultlist.removeClass("searchbox--active");
            const file = selected.data("t") as CommandItem;
            const backend = selected.data("b") as CommandPaletteBackend;
            backend.selected(file);
            this.close();
        }
    }

    private select(index: number) {
        const numChildren = this.resultlist.children().length;
        if (numChildren <= 0) return;
        this.currentSelected = Math.max(Math.min(index, numChildren - 1), 0);
        $(".searchbox__resultitem--selected").removeClass("searchbox__resultitem--selected");
        const newSelected = this.resultlist.children().get(this.currentSelected);
        newSelected.classList.add("searchbox__resultitem--selected");
    }

    private createList(backend: CommandPaletteBackend, items: CommandItem[]): JQuery<HTMLElement>[] {
        const elements: JQuery<HTMLElement>[] = [];
        for (let i = 0; i < Math.min(5, items.length); i++) {
            const f = items[i];
            const match = $(Utils.format(CommandPalette.result, f));
            match.click((_e) => {
                this.close();
                backend.selected(f);
            });
            match.hover((_e) => {
                this.select(i);
            });
            match.data("t", f);
            match.data("b", backend);
            elements.push(match);
        }
        return elements;
    }
}
