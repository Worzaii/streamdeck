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
  responseMode?: "message" | "json" | "none";
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

function getResponseTitle(
  response: any,
  responseMode?: string,
): string | undefined {
  if (responseMode === "none") {
    return undefined;
  }

  if (responseMode === "json") {
    return JSON.stringify(response.data ?? response, null, 2);
  }

  return response.message;
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

      streamDeck.logger.info(
        `CommandPayload response: ${JSON.stringify(response)}`,
      );

      if (!response.success) {
        await ev.action.showAlert();
        return;
      }

      await ev.action.showOk();

      const responseTitle = getResponseTitle(
        response,
        ev.payload.settings.responseMode,
      );

      if (responseTitle) {
        await ev.action.setTitle(responseTitle);

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
