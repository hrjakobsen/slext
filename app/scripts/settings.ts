import Dispatcher from './dispatcher';
import { File, FileUtils } from './file';
import * as $ from 'jquery';
import { Container, Inject, Service } from 'typedi';
import * as ace from 'ace-builds/src-noconflict/ace';
import { PageHook } from './pagehook.service';
import { Slext } from './slext';
import { TabModule } from './tabs';
import { ThemeModule } from './theme';
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
            '<div class="btn btn-full-height"><i class="fa fa-cog"></i><p class="toolbar-label">Slext Settings</p></div>'
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
            '.slext-settings__wrapper, .slext-settings__close *',
            function (e) {
                if (e.target != this) return true;
                menu.removeClass('slext-settings--active');
                return true;
            }
        );

        let themeSection = menu.find('.slext-settings__themes');

        for (let theme in ThemeModule.themes) {
            let themeElement = $(Utils.format(Settings.themeTemplate, ThemeModule.themes[theme]));
            themeElement.on("click", function () {
                self.dispatch("themeChanged", theme)
            });
            themeSection.append(themeElement);
        }

        $('header.toolbar .toolbar-right .btn.btn-full-height').first().before(button);
        button.click(function () {
            menu.addClass('slext-settings--active');
        });

        this.setUpCheckboxes(menu);

        $('body').append(menu);
    }

    private setUpCheckboxes(menu) {
        let settings = [
            "flags",
            "cursors",
            "temporary_tabs"
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
