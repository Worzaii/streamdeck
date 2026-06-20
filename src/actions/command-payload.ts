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
  payload?: string;
};

function parsePayload(payload?: string): unknown {
  if (!payload) {
    return undefined;
  }

  try {
    return JSON.parse(payload);
  } catch {
    return payload;
  }
}

@action({ UUID: "net.werzaire.wsclient.command-payload" })
export class CommandPayload extends SingletonAction<ButtonPressSettings> {
  override async onWillAppear(
    ev: WillAppearEvent<ButtonPressSettings>,
  ): Promise<void> {
    streamDeck.logger.info("CommandPayload action appeared");
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
        payload: parsePayload(ev.payload.settings.payload),
      });

      if (!response.success) {
        await ev.action.showAlert();
        return;
      }

      await ev.action.showOk();

      if (response.message) {
        await ev.action.setTitle(response.message);

        setTimeout(() => {
          if (websocketManager.connected) {
            ev.action.setTitle("Online");
          } else {
            ev.action.setTitle("Offline");
          }
        }, 5000);
      }
    } catch (error) {
      await ev.action.showAlert();
    }
  }
}
