import { CommandItem, CommandPaletteBackend } from "./commandpalette";
import { Service } from "typedi";
import { Slext } from "../slext";
import { File } from "../file";

@Service()
export class FileBackend implements CommandPaletteBackend {
    constructor(private slext: Slext) {}

    selected(item: CommandItem): void {
        const file = item.data as File;
        this.slext.selectFile(file);
    }

    getItems(filter: string): CommandItem[] {
        return this.slext
            .getFiles()
            .filter(function (file, _index) {
                return (
                    file.path.toLowerCase().startsWith(filter.toLowerCase()) ||
                    file.name.toLowerCase().startsWith(filter.toLowerCase())
                );
            })
            .map(function (file): CommandItem {
                return {
                    name: file.name,
                    description: file.path,
                    type: "file",
                    data: file,
                };
            });
    }

    getPrefix(): string {
        return null;
    }
}
