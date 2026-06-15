import {
  streamDeck,
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  TitleParametersDidChangeEvent,
} from "@elgato/streamdeck";

/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "com.worzaii.test.button-press" })
export class ButtonPress extends SingletonAction {
  override onWillAppear(ev: WillAppearEvent): void | Promise<void> {
    streamDeck.logger.info("ButtonPress action appeared");
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    streamDeck.logger.info("Button pressed");
    ev.action.setTitle("Pressed!");
  }
}
