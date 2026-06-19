import {
  streamDeck,
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  DidReceiveSettingsEvent,
} from "@elgato/streamdeck";
import WebSocket from "ws";

type ButtonPressSettings = {
  websocketUrl?: string;
  action?: string;
};

@action({ UUID: "com.worzaii.test.ws-action" })
export class WsAction extends SingletonAction<ButtonPressSettings> {
  override onWillAppear(
    ev: WillAppearEvent<ButtonPressSettings>,
  ): void | Promise<void> {
    streamDeck.logger.info("WsAction action appeared");
  }

  override async onKeyDown(
    ev: KeyDownEvent<ButtonPressSettings>,
  ): Promise<void> {
    streamDeck.logger.info("WsAction key down");

    const websocketUrl = "ws://localhost:3000";
    const action = { action: ev.payload.settings.action };

    const websocketMessage = JSON.stringify(action);

    streamDeck.logger.info(
      `Connecting to ${websocketUrl} and sending '${websocketMessage}'`,
    );

    const ws = new WebSocket(websocketUrl);

    ws.on("open", () => {
      streamDeck.logger.info("WebSocket connected");

      ws.send(websocketMessage);
    });

    ws.on("message", async (data) => {
      const response = data.toString();
      try {
        const jsonResponse = JSON.parse(response);
        streamDeck.logger.info(`Received response: ${response}`);
        if (!jsonResponse.success) {
          streamDeck.logger.error(`Command failed: ${jsonResponse.message}`);
          await ev.action.showAlert();
          ws.close();
          return;
        }

        await ev.action.setTitle(jsonResponse.message);
        await setTimeout(() => {
          ev.action.setTitle("");
        }, 5000);

        await ev.action.showOk();

        ws.close();
      } catch (error) {
        streamDeck.logger.error(`Failed to parse response: ${response}`);
        await ev.action.showAlert();
        ws.close();
        return;
      }
    });

    ws.on("error", async (error) => {
      streamDeck.logger.error(`WebSocket error: ${error.message}`);

      await ev.action.showAlert();
    });

    ws.on("close", () => {
      streamDeck.logger.info("WebSocket connection closed");
    });
  }

  // override async onDidReceiveSettings(
  //   ev: DidReceiveSettingsEvent<ButtonPressSettings>,
  // ): Promise<void> {
  //   streamDeck.logger.info(
  //     `WebSocket URL: ${ev.payload.settings.websocketUrl}`,
  //   );

  //   streamDeck.logger.info(
  //     `WebSocket Message: ${ev.payload.settings.websocketMessage}`,
  //   );
  // }
}
