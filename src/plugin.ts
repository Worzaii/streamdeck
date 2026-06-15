import streamDeck from "@elgato/streamdeck";

import { IncrementCounter } from "./actions/increment-counter";
import { ButtonPress } from "./actions/button-press";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel("trace");

// Register the increment action.
streamDeck.actions.registerAction(new IncrementCounter());

// Register the button press action.
streamDeck.actions.registerAction(new ButtonPress());

// Finally, connect to the Stream Deck.
streamDeck.connect();
