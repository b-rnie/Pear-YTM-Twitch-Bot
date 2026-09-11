
import ytSearch from 'yt-search';


const YTM_PORT = 26538;
const YTM_URL = `http://localhost:${YTM_PORT}`;

export async function getSongName() {
  try {
    let receive = await fetch(`${YTM_URL}/api/v1/song`);
    const data = await receive.json();

    if (data.isPaused) {
      return "No Song Playing"
    }

    const author = data.author || data.artist;
    const title = data.title;
    return `${author} - ${title}`;

  } catch (err) {
    console.error("Could not reach Pear Youtube API:", err.message);
    return "Music Player Unavailable";
  }
}

export async function addSongtoQueue(searchQuery) {
  try {
    const searchResult = await ytSearch(searchQuery);

    const videoId = searchResult.videos[0].videoId;
    console.log(`Found YouTube Song: "${searchResult.videos[0].title}" [${videoId}]`);

    let receive = await fetch(`${YTM_URL}/api/v1/queue`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoId: videoId,
        insertPosition: "INSERT_AT_END"
      })
    });

    return receive.ok;
  } catch (err) {
    console.error("Unable to add Song:", err.message);
    return false;
  }
}