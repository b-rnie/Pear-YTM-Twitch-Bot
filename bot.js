import WebSocket from 'ws';
import { addSongtoQueue, getSongName } from './ytmusic.js';
import { readFile } from 'fs/promises';
import { getAuth } from './auth.js';

let BOT_USER_ID = ''; // This is the User ID of the chat bot
let CLIENT_ID = ''; //This is the client id of your developer application
let CHAT_CHANNEL_USER_ID = ''; // This is the User ID of the channel that the bot will join and listen to chat messages of

let OAUTH_TOKEN = ''; //if this is your first time running it running the below cmd in console
//twitch token -u -s "user:bot user:read:chat user:write:chat"
let rTOKEN = ''; //refresh token


const EVENTSUB_WEBSOCKET_URL = 'wss://eventsub.wss.twitch.tv/ws';
const EVENTSUB_SUB_URL = 'https://api.twitch.tv/helix/eventsub/subscriptions'

var websocketSessionID;

// Start executing the bot from here
(async () => {
	const tokenData = JSON.parse(await readFile('./tokens.json', 'utf8'));
	OAUTH_TOKEN = tokenData.OAUTH_TOKEN;
	rTOKEN = tokenData.rTOKEN;
	 BOT_USER_ID = tokenData.BOT_ID;
	 CLIENT_ID = tokenData.CLIENT_ID;
	 CHAT_CHANNEL_USER_ID = tokenData.CHANNEL_ID

	// Verify that the authentication is valid
	const result = await getAuth(OAUTH_TOKEN, rTOKEN, CLIENT_ID);
	OAUTH_TOKEN = result.OAUTH_TOKEN;
	rTOKEN = result.rTOKEN;


	// Start WebSocket client and register handlers
	const websocketClient = startWebSocketClient();
})();



async function sendChatMessage(chatMessage) {
	let response = await fetch('https://api.twitch.tv/helix/chat/messages', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${OAUTH_TOKEN}`,
 			'Client-Id': CLIENT_ID,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			broadcaster_id: CHAT_CHANNEL_USER_ID,
			sender_id: BOT_USER_ID,
			message: chatMessage
		})
	});

	if (response.status != 200) {
		let data = await response.json();
		console.error("Failed to send chat message");
		console.error(data);
	} else {
		console.log("Sent chat message: " + chatMessage);
	}
}

function startWebSocketClient() {
	let websocketClient = new WebSocket(EVENTSUB_WEBSOCKET_URL);

	websocketClient.on('error', console.error);

	websocketClient.on('open', () => {
		console.log('WebSocket connection opened to ' + EVENTSUB_WEBSOCKET_URL);
	});

	websocketClient.on('message', (data) => {
		handleWebSocketMessage(JSON.parse(data.toString()));
	});

	return websocketClient;
}

async function handleWebSocketMessage(data) {
	switch (data.metadata.message_type) {
		case 'session_welcome': // First message you get from the WebSocket server when connecting
			websocketSessionID = data.payload.session.id; // Register the Session ID it gives us

			// Listen to EventSub, which joins the chatroom from your bot's account
			registerEventSubListeners();
			console.log("Now listening to chat messages in channel with User ID " + CHAT_CHANNEL_USER_ID);
			break;
		case 'notification': // An EventSub notification has occurred, such as channel.chat.message
			switch (data.metadata.subscription_type) {
				case 'channel.chat.message':
					// First, print the message to the program's console.
          const message= data.payload.event.message.text.trim();
					const sender = data.payload.event.chatter_user_login;
					console.log(`MSG #${data.payload.event.broadcaster_user_login} <${sender}> ${message}`);

					if(message.startsWith("!sr")) {
						const song = message.replace("!sr", "").trim();

						await addSongtoQueue(song);
						sendChatMessage(`@${sender}, Added "${song}" to queue`);
					}
					if(message == "!song") {
						const title = await getSongName();
						if(title == "No Song Playing" || title == "Music Player Unavailable") {
							sendChatMessage(`@${sender}, No Song Playing`);
							break;
						}
						sendChatMessage(`@${sender}, Currently Playing: ${title}`);
					}

			}
			break;
	}
}


async function registerEventSubListeners() {
	// Register channel.chat.message
	let response = await fetch(EVENTSUB_SUB_URL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${OAUTH_TOKEN}`,
			'Client-Id': CLIENT_ID,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			type: 'channel.chat.message',
			version: '1',
			condition: {
				broadcaster_user_id: CHAT_CHANNEL_USER_ID,
				user_id: BOT_USER_ID
			},
			transport: {
				method: 'websocket',
				session_id: websocketSessionID
			}
		})
	});

	if (response.status != 202) {
		let data = await response.json();
		console.error("Failed to subscribe to channel.chat.message. API call returned status code " + response.status);
		console.error(data);
		process.exit(1);
	} else {
		const data = await response.json();
		console.log(`Subscribed to channel.chat.message `);  //[${data.data[0].id}]
	}

}
