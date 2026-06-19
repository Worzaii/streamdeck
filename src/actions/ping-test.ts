import {
  streamDeck,
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";
import WebSocket from "ws";

type ButtonPressSettings = {
  websocketUrl?: string;
  websocketMessage?: string;
};

@action({ UUID: "net.werzaire.wsclient.ping-test" })
export class PingTest extends SingletonAction<ButtonPressSettings> {
  override onWillAppear(
    ev: WillAppearEvent<ButtonPressSettings>,
  ): void | Promise<void> {
    streamDeck.logger.info("PingTest action appeared");
  }

  override async onKeyDown(
    ev: KeyDownEvent<ButtonPressSettings>,
  ): Promise<void> {
    streamDeck.logger.info("Button pressed");

    const websocketUrl = "ws://localhost:3000";
    const action = { action: "ping" };
    const websocketMessage = JSON.stringify(action);

    const ws = new WebSocket(websocketUrl);

    ws.on("open", () => {
      streamDeck.logger.info("WebSocket connected");

      ws.send(websocketMessage);
    });

    ws.on("message", async (data) => {
      const response = data.toString();
      const jsonResponse = JSON.parse(response);

      streamDeck.logger.info(`Received response: ${response}`);

      await ev.action.setTitle(jsonResponse.message);
      await setTimeout(() => {
        ev.action.setTitle("");
      }, 5000);

      await ev.action.showOk();

      ws.close();
    });

    ws.on("error", async (error) => {
      streamDeck.logger.error(`WebSocket error: ${error.message}`);

      await ev.action.showAlert();
    });

    ws.on("close", () => {
      streamDeck.logger.info("WebSocket connection closed");
    });
  }
}
