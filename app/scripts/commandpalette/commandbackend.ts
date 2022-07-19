import { CommandItem, CommandPaletteBackend } from "./commandpalette";
import { Service, Container } from "typedi";
import { EditorCommands } from "../editorcommands/editorcommands";
import { NotificationService } from "../notification.service";

interface Command {
    func: () => void;
    description: string;
    name: string;
}

@Service()
export class CommandBackend implements CommandPaletteBackend {
    private _editorCommands;
    constructor() {
        this._editorCommands = Container.get(EditorCommands);
    }

    private commands: Command[] = [
        {
            name: "Character Count",
            func: () => {
                this._editorCommands.characterCount().then((response) => {
                    NotificationService.info(
                        response + " character" + (response == "1" ? " is" : "s are") + " selected"
                    );
                });
            },
            description: "Counts the number of selected characters",
        },
        {
            name: "Bold font",
            func: () => {
                this._editorCommands.wrapInCommand("textbf");
            },
            description: "Wrap selected text in \\textbf{}",
        },
        {
            name: "Italic font",
            func: () => {
                this._editorCommands.wrapInCommand("textit");
            },
            description: "Wrap selected text in \\textit{}",
        },
        {
            name: "Typewriter font",
            func: () => {
                this._editorCommands.wrapInCommand("texttt");
            },
            description: "Wrap selected text in \\texttt{}",
        },
    ];
    selected(item: CommandItem): void {
        const command = this.commands.find((x) => x.name == item.name);
        if (command !== undefined) command.func();
    }
    getItems(filter: string): CommandItem[] {
        return this.commands
            .filter((command) => {
                return command.name.toLowerCase().startsWith(filter.replace(this.getPrefix(), "").trim().toLowerCase());
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
