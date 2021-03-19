import { Slext } from './slext';
import { File } from './file';
import * as $ from 'jquery';
import { Utils } from './utils';
import { PersistenceService } from './persistence.service';
import { Container, Service, Inject } from "typedi";
import { Settings } from './settings';
import { TabModule } from './tabs';

export interface ThemeStructure {
    [key: string]: string;
    accentColor: string;
    accentColorHover: string;
    accentColorActive: string;
    textColor: string;
    textColorActive: string;
    backgroundColor: string;
    fileColor: string;
    fileColorHover: string;
    scrollbarBackgroundColor: string;
    scrollbarThumbColor: string;
    buttonColorHover: string;
    buttonBorder: string;
    actionColor: string;
    headerColor: string;
}

export interface Theme {
    name: string;
    theme: ThemeStructure;
}

@Service()
export class ThemeModule {
    static themes: Theme[] = [
        {
            name: 'Dark',
            theme: {
                accentColor: '#a93529',
                actionColor: '#a93529',
                accentColorHover: '#6b221a',
                accentColorActive: 'white',
                textColor: '#a4a4a4',
                textColorActive: 'white',
                backgroundColor: '#333',
                headerColor: '#333',
                fileColor: '#a4a4a4',
                fileColorHover: '#a93529',
                scrollbarBackgroundColor: '#313131',
                scrollbarThumbColor: '#535353',
                buttonBorder: '#cfcfcf',
                buttonColorHover: 'white'
            }
        },
        {
            name: 'Light',
            theme: {
                accentColor: '#a93529',
                accentColorHover: '#6b221a',
                actionColor: '#a93529',
                accentColorActive: 'white',
                textColor: '#808080',
                textColorActive: '#202020',
                backgroundColor: 'white',
                headerColor: 'white',
                fileColor: '#404040',
                fileColorHover: '#a93529',
                scrollbarBackgroundColor: '#eee',
                scrollbarThumbColor: '#ccc',
                buttonBorder: '#cfcfcf',
                buttonColorHover: 'rgba(0,0,0,0.1)'
            }
        },
        {
            name: 'Blue',
            theme: {
                accentColor: '#609090',
                actionColor: '#609090',
                accentColorHover: '#add3e1',
                accentColorActive: '#839496',
                textColor: '#809090',
                textColorActive: '#ccffff',
                backgroundColor: '#002b36',
                headerColor: '#002b36',
                fileColor: '#586e75',
                fileColorHover: '#add3e1',
                scrollbarBackgroundColor: '#073642',
                scrollbarThumbColor: '#586e75',
                buttonBorder: '#cfcfcf',
                buttonColorHover: '#657b83'
            }
        },
        {
            name: 'Overleaf-light',
            theme: {
                accentColor: '#4f9c45',
                actionColor: '#727E91',
                accentColorHover: '#418038',
                accentColorActive: 'white',
                textColor: '#808080',
                textColorActive: '#202020',
                backgroundColor: 'white',
                headerColor: 'white',
                fileColor: '#9DA7B7',
                fileColorHover: '#9DA7B7',
                scrollbarBackgroundColor: '#eee',
                scrollbarThumbColor: '#ccc',
                buttonBorder: '#cfcfcf',
                buttonColorHover: 'rgba(0,0,0,0.1)'
            }
        },
        {
            name: 'Overleaf-dark',
            theme: {
                accentColor: '#4f9c45',
                actionColor: 'white',
                accentColorHover: '#418038',
                accentColorActive: 'white',
                textColor: '#ccc',
                textColorActive: 'white',
                backgroundColor: '#455265',
                headerColor: '#1E2530',
                fileColor: '#ddd',
                fileColorHover: '#ddd',
                scrollbarBackgroundColor: '#eee',
                scrollbarThumbColor: '#ccc',
                buttonBorder: '#cfcfcf',
                buttonColorHover: 'rgba(0,0,0,0.1)'
            }
        },
        {
            name: 'Arc-Dark',
            theme: {
                accentColor: '#5294e2',
                actionColor: '#5294e2',
                accentColorHover: '6b221a',
                accentColorActive: 'white',
                textColor: '#a4a4a4',
                textColorActive: 'white',
                backgroundColor: '#2f343f',
                headerColor: '#2f343f',
                fileColor: '#a4a4a4',
                fileColorHover: '#5294e2',
                scrollbarBackgroundColor: '#2f343f',
                scrollbarThumbColor: '#535353',
                buttonBorder: '#cfcfcf',
                buttonColorHover: 'white'
            }
        }
    ];

    private settings: Settings;

    constructor(private slext: Slext) {
        // This does not work with constructor injection, and I don't know why
        this.settings = Container.get(Settings);
        var self = this;
        this.fixIcon();
        PersistenceService.load('theme', function (theme: number | ThemeStructure) {
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
            self.setTheme(theme);
        });

        this.settings.addEventListener("themeChanged", self.setTheme);
    }

    public setTheme(theme: ThemeStructure) {
        PersistenceService.save('theme', theme);
        for (let key in theme) {
            document.documentElement.style.setProperty(
                `--${key}`,
                theme[key]
            );
        }
    }

    private fixIcon() {
        var icon = $('.review-icon');
        icon.addClass('sl-review-icon');
        icon.removeClass('review-icon');
        icon.html(require('../templates/icon.html'));
    }
}
