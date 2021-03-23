import Dispatcher from "./dispatcher";
import { File, FileUtils } from "./file";
import * as $ from "jquery";
import { Container, Inject, Service } from "typedi";
import * as ace from "ace-builds/src-noconflict/ace";
import { PageHook } from "./pagehook.service";
import { Slext } from "./slext";
import { TabModule } from "./tabs";
import { ThemeModule } from "./theme";
import { Utils } from "./utils";
import { PersistenceService } from "./persistence.service";

interface Notification {
    type: string;
    content: string;
}

export class NotificationService {
    private static notificationWrapper: string = require("../templates/notificationwrapper.html");
    private static notification: string = require("../templates/notification.html");
    private static menu: JQuery<HTMLElement> = null;

    public static warn(content: string) {
        return NotificationService.addNotification({
            type: "warning",
            content: content,
        });
    }

    public static error(content: string) {
        return NotificationService.addNotification({
            type: "error",
            content: content,
        });
    }

    public static info(content: string) {
        return NotificationService.addNotification({
            type: "info",
            content: content,
        });
    }

    private static addNotification(notification: Notification) {
        if (NotificationService.menu == null) {
            NotificationService.menu = $(NotificationService.notificationWrapper);
            $(document.body).append(NotificationService.menu);
        }

        let notificationElement = $(Utils.format(NotificationService.notification, notification));
        let removeNotification = () => {
            notificationElement.fadeOut(300, function () {
                $(this).remove();
            });
        };
        notificationElement.click(removeNotification);

        setInterval(removeNotification, 10000);
        NotificationService.menu.append(notificationElement);
    }
}
