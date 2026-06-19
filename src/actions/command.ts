import {
  streamDeck,
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";
import { websocketManager } from "../websocket/websocket-manager";

type ButtonPressSettings = {
  action?: string;
};

@action({ UUID: "net.werzaire.wsclient.command" })
export class Command extends SingletonAction<ButtonPressSettings> {
  override async onWillAppear(
    ev: WillAppearEvent<ButtonPressSettings>,
  ): Promise<void> {
    streamDeck.logger.info("Command action appeared");
    if (websocketManager.connected) {
      await ev.action.setTitle("Online");
    } else {
      await ev.action.setTitle("Offline");
    }
  }

  override async onKeyDown(
    ev: KeyDownEvent<ButtonPressSettings>,
  ): Promise<void> {
    try {
      const response = await websocketManager.sendRequest({
        action: ev.payload.settings.action,
      });

      if (!response.success) {
        await ev.action.showAlert();
        return;
      }

      await ev.action.showOk();

      if (response.message) {
        await ev.action.setTitle(response.message);

        setTimeout(() => {
          ev.action.setTitle("");
        }, 5000);
      }
    } catch (error) {
      await ev.action.showAlert();
    }
  }
}
