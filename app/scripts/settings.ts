import * as $ from "jquery";
import { Service } from "typedi";
import { Slext } from "./slext";
import { TabModule } from "./tabs";
import { ThemeModule } from "./theme";
import { Utils } from "./utils";
import { PersistenceService } from "./persistence.service";
import { Dispatcher } from "./dispatcher";

class Plugin {
    name: string;
    type: any;
    children: Plugin[];
}

@Service()
export class Settings extends Dispatcher {
    private static settingsTemplate: string = require("../templates/settings.html");
    private static themeTemplate: string = require("../templates/themeitem.html");
    private static themeColorTemplate: string = require("../templates/custom_theme_color.html");

    private static pluginStructure: Plugin[] = [
        {
            name: "Slext",
            type: Slext,
            children: [
                {
                    name: "Tabs",
                    type: TabModule,
                    children: [],
                },
            ],
        },
    ];

    constructor() {
        super();
        const button = $(
            '<div class="toolbar-item"><button class="btn btn-full-height"><i class="fa fa-cog"></i><p class="toolbar-label">SLext Settings</p></button></div>'
        );
        const menu = $(
            Utils.format(Settings.settingsTemplate, {
                meta_key: PersistenceService.load("meta_key", null) || "Alt",
            })
        );
        menu.find(".slext-settings__plugins").append(
            Settings.pluginStructure.map((x) => Settings.generatePluginList(x))
        );
        menu.on("click", ".slext-settings__wrapper, .slext-settings__close *, .slext-settings__close", function (e) {
            if (e.target != this) return true;
            menu.removeClass("slext-settings--active");
            return true;
        });

        const themeSection = menu.find(".slext-settings__themes");
        const themeButtons = [];
        for (let theme = 0; theme < ThemeModule.themes.length; theme++) {
            const themeElement = $(Utils.format(Settings.themeTemplate, ThemeModule.themes[theme]));
            themeElement.on("click", () => {
                this.dispatch("themeChanged", ThemeModule.themes[theme].theme);
            });
            themeButtons.push(themeElement);
        }
        themeButtons.reverse().forEach((b) => themeSection.prepend(b));
        menu.find(".slext-settings__custom-theme-button").on("click", function () {
            $(".slext-settings__custom-theme").toggleClass("slext-hidden");
        });

        PersistenceService.load("theme", (theme) => {
            this.setTheme(menu, theme);
        });

        this.addEventListener("themeChanged", (theme) => this.setTheme(menu, theme));

        menu.on("change", ".color-input", () => {
            const colors = menu.find(".color-input");
            // Construct theme
            const theme = {};
            colors.each((_i, el) => {
                theme[el.id.replace("color-", "")] = $(el).val();
            });
            this.dispatch("themeChanged", theme);
        });
        menu.on("change", ".slext-color-selector", function (e) {
            const colorSelector = $(this);
            const inputField = colorSelector.data("color-input") as JQuery<HTMLElement>;
            inputField.val((e.target as HTMLInputElement).value).change();
        });
        menu.find(".slext-settings__custom_theme_string").on("change", (e) => {
            const value = $(e.currentTarget).val() as string;
            const colors = value.split(";").map((x) => x.trim());
            const theme = {};

            //Use theme 0 for default colors
            const defaultTheme = ThemeModule.themes[0].theme;
            let count = 0;
            for (const key in defaultTheme) {
                if (count >= colors.length) {
                    theme[key] = defaultTheme[key];
                } else {
                    theme[key] = colors[count];
                }
                count++;
            }
            this.setTheme(menu, theme);
            this.dispatch("themeChanged", theme);
        });

        $("header.toolbar .toolbar-right .toolbar-item").first().before(button);
        button.on("click", function () {
            menu.addClass("slext-settings--active");
        });

        $(document).keydown(function (e) {
            if (e.which == 27) {
                //Escape key
                menu.removeClass("slext-settings--active");
            }
        });

        this.setUpCheckboxes(menu);
        this.setUpDropdowns(menu);

        menu.on("change", "#sl_meta_key", (e) => {
            const val = (e.currentTarget as HTMLInputElement).value;
            $(".sl_meta_key_icon").text(val);
        });

        $("body").append(menu);
    }

    private setTheme(menu, theme) {
        try {
            if (theme == null) {
                theme = ThemeModule.themes[0].theme;
            } else if (typeof theme === "number" || !isNaN(parseInt(theme.toString()))) {
                theme = ThemeModule.themes[parseInt(theme.toString())].theme;
            }
        } catch (err) {
            // Default to the first theme, if a theme could not be loaded
            theme = ThemeModule.themes[0].theme;
        }
        const customThemeColors = menu.find(".slext-settings__custom_theme_colors");
        customThemeColors.empty();

        const colors = [];
        let tabIndex = 1;

        for (const key in theme) {
            colors.push(theme[key]);
            const themeColor = $(
                Utils.format(Settings.themeColorTemplate, {
                    name: key,
                    color: theme[key],
                    index: tabIndex++,
                })
            );
            const colorInput = themeColor.find(".color-input");
            const colorPicker = themeColor.find(".slext-color-selector");
            colorPicker.data("color-input", colorInput);
            customThemeColors.append(themeColor);
        }

        menu.find(".slext-settings__custom_theme_string").val(colors.join("; "));
    }

    private setUpCheckboxes(menu) {
        const settings = [
            "flags",
            "cursors",
            "temporary_tabs",
            "main_tab_first",
            "command_prefix",
            "invert_pdf",
            "pdf_padding",
            "comments_highlight",
            "comments_underline",
        ];

        settings.forEach((setting) => {
            PersistenceService.load(setting, function (toggled) {
                toggled = toggled || false;
                const el = menu.find("#sl_" + setting);
                el.prop("checked", toggled);
            });

            menu.on("change", "#sl_" + setting, (e) => {
                const checked = (e.currentTarget as HTMLInputElement).checked;
                this.dispatch(setting + "Changed", checked);
                PersistenceService.save(setting, checked);
            });
        });
    }

    private setUpDropdowns(menu) {
        const settings = ["meta_key"];

        settings.forEach((setting) => {
            PersistenceService.load(setting, (value) => {
                const el = menu.find("#sl_" + setting);
                if (value === null) {
                    value = el.first("option").val();
                    el.val(value);
                }
                el.val(value);
            });

            menu.on("change", "#sl_" + setting, (e) => {
                const value = (e.currentTarget as HTMLInputElement).value;
                this.dispatch(setting + "Changed", value);
                PersistenceService.save(setting, value);
            });
        });
    }

    private static generatePluginList(plugin: Plugin): JQuery<HTMLElement> {
        const element = $(`
            <li class="slext-settings__plugin"><input type="checkbox">${plugin.name}</li>
        `);
        if (plugin.children.length > 0) {
            const list = $(`
                <ul class="slext-settings__pluginlist"></ul>
            `);
            plugin.children.forEach((child) => {
                list.append(Settings.generatePluginList(child));
            });
            element.append(list);
        }
        return element;
    }
}
