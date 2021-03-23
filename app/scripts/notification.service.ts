import * as $ from "jquery";
import { Utils } from "./utils";

interface Notification {
    type: string;
    content: string;
}

export class NotificationService {
    private static notificationWrapper: string = require("../templates/notificationwrapper.html");
    private static notification: string = require("../templates/notification.html");
    private static menu: JQuery<HTMLElement> = null;

    public static warn(content: string): void {
        return NotificationService.addNotification({
            type: "warning",
            content: content,
        });
    }

    public static error(content: string): void {
        return NotificationService.addNotification({
            type: "error",
            content: content,
        });
    }

    public static info(content: string): void {
        return NotificationService.addNotification({
            type: "info",
            content: content,
        });
    }

    private static addNotification(notification: Notification): void {
        if (NotificationService.menu == null) {
            NotificationService.menu = $(NotificationService.notificationWrapper);
            $(document.body).append(NotificationService.menu);
        }

        const notificationElement = $(Utils.format(NotificationService.notification, notification));
        const removeNotification = () => {
            notificationElement.fadeOut(300, function () {
                $(this).remove();
            });
        };
        notificationElement.click(removeNotification);

        setInterval(removeNotification, 10000);
        NotificationService.menu.append(notificationElement);
    }
}
