import { CommandItem, CommandPaletteBackend } from './commandpalette';
import { Service } from 'typedi';
import { Slext } from '../slext';
import { File } from '../file';
import * as $ from 'jquery';


@Service()
export class FileBackend implements CommandPaletteBackend {
    constructor(private slext: Slext) {

    }

    selected(item: CommandItem): void {
        let file = item.data as File;
        $(file.handle).click();
    }

    getItems(filter: string): CommandItem[] {
        return this.slext.getFiles()
            .filter(function (file, index) {
                return file.path.toLowerCase().startsWith(filter.toLowerCase()) || file.name.toLowerCase().startsWith(filter.toLowerCase());
            })
            .map(function (file): CommandItem {
                return {
                    name: file.name,
                    description: file.path,
                    type: "file",
                    data: file
                }
            });
    }

    getPrefix(): string {
        return null;
    }
}