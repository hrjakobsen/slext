import { Slext } from '../slext';
import { Service, Container } from 'typedi';
import { File } from '../file';
import * as $ from 'jquery';
import { Utils } from '../utils';
import { PersistenceService } from '../persistence.service';
import { Logger } from '../logger';
import { FileBackend } from './filebackend';
import { CommandBackend } from './commandbackend';
import { Settings } from '../settings';

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
    private static box: string = require('../../templates/searchbox.html');
    private static result: string = require('../../templates/searchresult.html');
    private prefixRequired: boolean;
    box: JQuery<HTMLElement>;
    resultlist: JQuery<HTMLElement>;
    active = false;
    currentSelected = -1;
    private backends: CommandPaletteBackend[];
    private settings: Settings;

    constructor(private slext: Slext) {
        this.backends = [
            Container.get(FileBackend),
            Container.get(CommandBackend),
        ];
        this.settings = Container.get(Settings);
        let self = this;
        this.box = $(CommandPalette.box);
        this.resultlist = this.box.children('.searchbox__results');
        $('body').append(this.box);

        PersistenceService.load("command_prefix", r => self.prefixRequired = r || false);
        this.settings.addEventListener("command_prefixChanged", r => self.prefixRequired = r || false);

        $(document).keydown(function (e) {
            
            // We're only interested in the ALT key
            if (!(e.ctrlKey || e.shiftKey || e.metaKey) && e.altKey) {
                if (e.which == 80) { // p
                    self.box.toggleClass('searchbox--active');
                    self.active = !self.active;
                    if (self.active) {
                        self.box.children('.searchbox__field').focus();
                        self.box.children('.searchbox__field').select();
                    }
                    e.preventDefault();
                }
            }
                
            if (e.which == 27) { // esc
                self.close();
                e.preventDefault();
            }
        });

        this.box.on('keydown', '.searchbox__field', function (e) {
            if (e.which == 13) { // enter
                self.selectFile();
            }
            if (e.which == 38) { // up
                self.select(self.currentSelected - 1);
                e.preventDefault();
            }
            if (e.which == 40) { // down
                self.select(self.currentSelected + 1);
                e.preventDefault();
            }
        });

        this.box.on('input', '.searchbox__field', function (e) {
            let inputfield = $(this);
            let text = inputfield.val() as string;

            let backendsToSearch = self.backends;

            if (self.prefixRequired) {
                backendsToSearch = backendsToSearch.filter(backend => {
                    if (text.length == 0) {
                        return backend.getPrefix() == null;
                    }
                    return backend.getPrefix() == null || backend.getPrefix() == text.slice(0, backend.getPrefix().length);
                })
            }

            self.resultlist.empty();

            backendsToSearch.forEach(backend => {
                if (self.resultlist.children().length >= 5) return;
                self.resultlist.append(self.createList(backend, backend.getItems(text)).slice(0, 5 - self.resultlist.children().length));
            });

            if (self.resultlist.children().length > 0) {
                self.select(0);
            }
        });
    }

    private close() {
        this.active = false;
        this.box.removeClass('searchbox--active');
    }

    private selectFile() {
        let selected = $('.searchbox__resultitem--selected');
        this.resultlist.removeClass('searchbox--active');
        let file = selected.data('t') as CommandItem;
        let backend = selected.data('b') as CommandPaletteBackend;
        backend.selected(file);
        this.close();
    }

    private select(index: number) {
        let numChildren = this.resultlist.children().length;
        if (numChildren <= 0) return;
        this.currentSelected = Math.max(Math.min(index, numChildren - 1), 0);
        $('.searchbox__resultitem--selected').removeClass(
            'searchbox__resultitem--selected'
        );
        let newSelected = this.resultlist.children().get(this.currentSelected);
        newSelected.classList.add('searchbox__resultitem--selected');
    }

    private createList(backend: CommandPaletteBackend, items: CommandItem[]): JQuery<HTMLElement>[] {
        let self = this;
        let elements: JQuery<HTMLElement>[] = [];
        for (let i = 0; i < Math.min(5, items.length); i++) {
            let f = items[i];
            let match = $(Utils.format(CommandPalette.result, f));
            match.click(function (e) {
                self.select(i);
                self.close();
                backend.selected(f);
            });
            match.data('t', f);
            match.data('b', backend);
            elements.push(match);
        }
        return elements;
    }
}
