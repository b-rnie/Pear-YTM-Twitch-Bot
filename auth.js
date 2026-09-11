import {readFile, writeFile} from 'fs/promises';

export async function getAuth(OAUTH_TOKEN, rTOKEN, CLIENT_ID) {
	let response = await fetch('https://id.twitch.tv/oauth2/validate', {
		method: 'GET',
		headers: { Authorization: `OAuth ${OAUTH_TOKEN}` }
	});

	if(response.status == 200) {
		console.log("Validated token");
		return{OAUTH_TOKEN, rTOKEN};
	}

	let data = await response.json(); 
	console.error("Token is not valid. /oauth2/validate returned status code " + response.status);
	console.error(data);
	
	const tokenData = await refreshToken(rTOKEN, CLIENT_ID);
	console.log("Validated token");
	return tokenData;
	
}

async function refreshToken(rTOKEN, CLIENT_ID) {
	const tokenData = JSON.parse(await readFile('./tokens.json', 'utf8'));
	const CLIENT_SECRET = tokenData.CLIENT_SECRET;

	const param = new URLSearchParams({
		client_id: CLIENT_ID,
		client_secret: CLIENT_SECRET,
		grant_type: "refresh_token",
		refresh_token: rTOKEN
	});

	const response = await fetch('https://id.twitch.tv/oauth2/token', {
		method: 'POST',
		body: param
	});

	const data = await response.json();
	if (response.status != 200) {
		console.error("Token refresh failed, returned status code " + response.status);
		console.error(data);
		process.exit(1);
	}

	const OAUTH_TOKEN = data.access_token;
	rTOKEN = data.refresh_token;
	console.log("Token refreshed");


	await writeFile( './tokens.json',
		JSON.stringify(
			{
				OAUTH_TOKEN,
				rTOKEN
			},
			null,
			4
		));
  return{OAUTH_TOKEN, rTOKEN};

}