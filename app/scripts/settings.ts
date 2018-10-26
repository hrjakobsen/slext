import Dispatcher from './dispatcher';
import { File, FileUtils } from './file';
import * as $ from 'jquery';
import { Container, Inject, Service } from 'typedi';
import * as ace from 'ace-builds/src-noconflict/ace';
import { PageHook } from './pagehook.service';
import { Slext } from './slext';
import { TabModule } from './tabs';
import { ThemeModule, Theme } from './theme';
import { Utils } from './utils';
import { PersistenceService } from './persistence.service';

class Plugin {
    name: string;
    type: any;
    children: Plugin[];
}

@Service()
export class Settings extends Dispatcher {
    private static settingsTemplate: string = require('../templates/settings.html');
    private static themeTemplate: string = require('../templates/themeitem.html');
    private static themeColorTemplate: string = require('../templates/custom_theme_color.html');

    private static pluginStructure: Plugin[] = [
        {
            name: 'Slext',
            type: Slext,
            children: [
                {
                    name: 'Tabs',
                    type: TabModule,
                    children: []
                }
            ]
        }
    ];

    constructor() {
        super();
        let self = this;
        let button = $(
            '<div class="btn btn-full-height"><i class="fa fa-cog"></i><p class="toolbar-label">SLext Settings</p></div>'
        );
        let menu = $(Settings.settingsTemplate);
        menu
            .find('.slext-settings__plugins')
            .append(
                Settings.pluginStructure.map(x =>
                    Settings.generatePluginList(x)
                )
            );
        menu.on(
            'click',
            '.slext-settings__wrapper, .slext-settings__close *, .slext-settings__close',
            function (e) {
                if (e.target != this) return true;
                menu.removeClass('slext-settings--active');
                return true;
            }
        );

        let themeSection = menu.find('.slext-settings__themes');
        let themeButtons = [];
        for (let theme = 0; theme < ThemeModule.themes.length; theme++) {
            let themeElement = $(Utils.format(Settings.themeTemplate, ThemeModule.themes[theme]));
            themeElement.on("click", function () {
                self.dispatch("themeChanged", ThemeModule.themes[theme].theme)
            });
            themeButtons.push(themeElement);
        }
        themeButtons.reverse().forEach(b => themeSection.prepend(b));
        menu
            .find(".slext-settings__custom-theme-button")
            .on('click', function() {
                $(".slext-settings__custom-theme").toggleClass("slext-hidden");
            });



        PersistenceService.load('theme', theme => {
            this.setTheme(menu, theme);
        });

        this.addEventListener("themeChanged", (theme) => this.setTheme(menu, theme));

        menu
            .on("change", ".color-input", function() {
                let colors = menu.find('.color-input');
                // Construct theme
                let theme = {};
                colors.each((i, el) => {
                    theme[el.id.replace("color-", "")] = $(el).val();
                });
                self.dispatch("themeChanged", theme);
            });
        menu
            .on("change", ".slext-color-selector", function(e) {
                let colorSelector = $(this);
                let inputField = colorSelector.data("color-input") as JQuery<HTMLElement>;
                inputField.val((e.target as HTMLInputElement).value).change();;
            });
        menu
            .find(".slext-settings__custom_theme_string").on("change", function() {
                let value = $(this).val() as string;
                let colors = value.split(";").map(x => x.trim());
                let theme = {};

                //Use theme 0 for default colors
                let defaultTheme = ThemeModule.themes[0].theme;
                let count = 0;
                for (let key in defaultTheme) {
                    if (count >= colors.length) {
                        theme[key] = defaultTheme[key];
                    } else {
                        theme[key] = colors[count];
                    }
                    count++;
                }
                self.setTheme(menu, theme);
                self.dispatch("themeChanged", theme);
            });
        

        $('header.toolbar .toolbar-right .btn.btn-full-height').first().before(button);
        button.click(function () {
            menu.addClass('slext-settings--active');
        });

        $(document).keydown(function (e) {
            if (e.which == 27) { //Escape key
                menu.removeClass('slext-settings--active');
            }
        });

        this.setUpCheckboxes(menu);

        $('body').append(menu);
    }

    private setTheme(menu, theme) {
            try {
                if (theme == null) {
                    theme = ThemeModule.themes[0].theme;
                } else if (typeof theme === 'number' || !isNaN(parseInt(theme.toString()))) {
                    theme = ThemeModule.themes[parseInt(theme.toString())].theme;
                }
            } catch(err) {
                // Default to the first theme, if a theme could not be loaded
                theme = ThemeModule.themes[0].theme;
            }
            let customThemeColors = menu.find('.slext-settings__custom_theme_colors');
            customThemeColors.empty();

            let colors = [];
            let tabIndex = 1;

            for (let key in theme) {
                colors.push(theme[key])
                let themeColor = $(Utils.format(Settings.themeColorTemplate, {name: key, color: theme[key], index: tabIndex++}));
                let colorInput = themeColor.find(".color-input");
                let colorPicker = themeColor.find(".slext-color-selector");
                colorPicker.data("color-input", colorInput);
                customThemeColors.append(themeColor);
            }

            menu
                .find(".slext-settings__custom_theme_string")
                .val(colors.join("; "));
        }

    private setUpCheckboxes(menu) {
        let settings = [
            "flags",
            "cursors",
            "temporary_tabs",
            "main_tab_first",
            "command_prefix",
            "invert_pdf"
        ]
        let self = this;

        settings.forEach(setting => {
            PersistenceService.load(setting, function (toggled) {
                toggled = toggled || false;
                let el = menu.find("#sl_" + setting);
                el.prop("checked", toggled);
            });

            menu.on("change", "#sl_" + setting, function () {
                let checked = (this as HTMLInputElement).checked;
                self.dispatch(setting + "Changed", checked);
                PersistenceService.save(setting, checked);
            });
        });
    }

    private static generatePluginList(plugin: Plugin): JQuery<HTMLElement> {
        let element = $(`
            <li class="slext-settings__plugin"><input type="checkbox">${
            plugin.name
            }</li>
        `);
        if (plugin.children.length > 0) {
            let list = $(`
                <ul class="slext-settings__pluginlist"></ul>
            `);
            plugin.children.forEach(child => {
                list.append(Settings.generatePluginList(child));
            });
            element.append(list);
        }
        return element;
    }
}
