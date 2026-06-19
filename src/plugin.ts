import streamDeck from "@elgato/streamdeck";

import { WsAction } from "./actions/ws-action";
import { WSPingTest } from "./actions/wsping-test";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel("trace");

// Register the button press action.
streamDeck.actions.registerAction(new WsAction());

streamDeck.actions.registerAction(new WSPingTest());

// Finally, connect to the Stream Deck.
streamDeck.connect();
