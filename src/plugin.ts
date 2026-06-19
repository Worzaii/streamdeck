import streamDeck from "@elgato/streamdeck";

import { Command } from "./actions/command";
import { PingTest } from "./actions/ping-test";

import { websocketManager } from "./websocket/websocket-manager";
import { CommandPayload } from "./actions/command-payload";

console.log(`Starting the websocketManager.`);

websocketManager.connect();

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel("trace");

// Register the button press action.
streamDeck.actions.registerAction(new Command());

streamDeck.actions.registerAction(new PingTest());

streamDeck.actions.registerAction(new CommandPayload());

// Finally, connect to the Stream Deck.
streamDeck.connect();
