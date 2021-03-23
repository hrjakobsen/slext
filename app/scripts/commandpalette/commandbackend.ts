import { CommandItem, CommandPaletteBackend } from "./commandpalette";
import { Service, Container } from "typedi";
import { EditorCommands } from "../editorcommands";
import { NotificationService } from "../notification.service";

interface Command {
    func: Function;
    description: string;
    name: string;
}

@Service()
export class CommandBackend implements CommandPaletteBackend {
    private commands: Command[] = [
        {
            name: "Character Count",
            func: function () {
                Container.get(EditorCommands)
                    .characterCount()
                    .then((response) => {
                        NotificationService.info(
                            response + " character" + (response == "1" ? " is" : "s are") + " selected"
                        );
                    });
            },
            description: "Counts the number of selected characters",
        },
    ];
    constructor() {}
    selected(item: CommandItem): void {
        let command = this.commands.find((x) => x.name == item.name);
        if (command !== undefined) command.func();
    }
    getItems(filter: string): CommandItem[] {
        let self = this;
        return this.commands
            .filter((command) => {
                return command.name.toLowerCase().startsWith(filter.replace(self.getPrefix(), "").trim().toLowerCase());
            })
            .map(function (cmd): CommandItem {
                return {
                    name: cmd.name,
                    description: cmd.description,
                    data: null,
                    type: "command",
                };
            });
    }
    getPrefix(): string {
        return ">";
    }
}
