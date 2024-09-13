use serde::{Deserialize, Serialize};

// Struct for the top-level response when fetching by ID
#[derive(Debug, Serialize, Deserialize)]
pub struct JikanAnimeDetailsWrapper {
    pub data: JikanAnimeDetailsResponse,
}

// Struct for anime details returned by ID fetch
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JikanAnimeDetailsResponse {
    pub mal_id: i32,
    pub title: String,
    pub episodes: Option<i32>,
    pub aired: Option<JikanAired>,
    pub year: Option<i32>,
}

// Struct for aired date
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JikanAired {
    pub from: Option<String>,
    pub to: Option<String>,
}

// Struct to hold episode information
#[derive(Debug, Serialize, Deserialize)]
pub struct JikanEpisode {
    pub title: Option<String>,
    pub aired: Option<String>,
}

// Struct to hold the response for episodes
#[derive(Debug, Serialize, Deserialize)]
pub struct JikanEpisodeResponse {
    pub data: Vec<JikanEpisode>,
}

// Struct to hold anime search result
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JikanSearchAnime {
    pub mal_id: i32,
    pub title: String,
    pub aired: Aired,
}

// Struct to hold aired information (for start year)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Aired {
    pub from: Option<String>,
}

// Struct for the search response from Jikan
#[derive(Debug, Serialize, Deserialize)]
pub struct JikanSearchResponse {
    pub data: Vec<JikanSearchAnime>,
}

// Struct to hold episodes grouped by season
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SeasonedEpisodes {
    pub season: i32,
    pub start_episode: i32,
    pub end_episode: i32,
    pub titles: Vec<String>,
}

// Struct to hold show details along with episodes
#[derive(Debug, Serialize, Deserialize)]
pub struct ShowDetailsWithEpisodes {
    pub id: i32,
    pub name: String,
    pub premiered_year: Option<String>,
    pub episodes_by_season: Vec<SeasonedEpisodes>,
}


// Struct to hold episode information from TVMaze API
#[derive(Debug, Serialize, Deserialize)]
pub struct TVMazeEpisode {
    pub season: i32,
    pub number: i32,
    pub name: Option<String>,
    pub airdate: Option<String>,
}

// Struct to hold the search result response for finding anime by name
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TVMazeShow {
    pub id: i32,
    pub name: String,
    pub premiered: Option<String>,
}

// Struct for the search response from TVMaze
#[derive(Debug, Serialize, Deserialize)]
pub struct TVMazeSearchResponse {
    pub show: TVMazeShow,
}
