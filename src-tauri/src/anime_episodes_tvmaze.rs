use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::fmt;
use tauri::command;

// Struct to hold episode information from TVmaze
#[derive(Debug, Serialize, Deserialize)]
struct TVmazeEpisode {
    id: i32,
    name: String,
    season: i32,
    number: i32,
}

// Struct to hold the response for episodes
#[derive(Debug, Serialize, Deserialize)]
struct TVmazeShow {
    id: i32,
    name: String,
}

// Struct to hold episodes grouped by season
#[derive(Debug, Serialize, Deserialize)]
pub struct SeasonedEpisodes {
    season: i32, // Season number
    start_episode: i32,
    end_episode: i32,
    titles: Vec<String>,
}

// Custom error type for better error handling
#[derive(Debug)]
pub enum FetchError {
    RequestError(reqwest::Error),
    ParsingError(serde_json::Error),
    NotFoundError(String),
}

impl fmt::Display for FetchError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            FetchError::RequestError(err) => write!(f, "Request Error: {}", err),
            FetchError::ParsingError(err) => write!(f, "Parsing Error: {}", err),
            FetchError::NotFoundError(message) => write!(f, "Not Found Error: {}", message),
        }
    }
}

impl From<reqwest::Error> for FetchError {
    fn from(error: reqwest::Error) -> Self {
        FetchError::RequestError(error)
    }
}

impl From<serde_json::Error> for FetchError {
    fn from(error: serde_json::Error) -> Self {
        FetchError::ParsingError(error)
    }
}

#[command]
pub async fn fetch_tvmaze_episode_titles_grouped_by_season(
    anime_name: String,
) -> Result<Vec<SeasonedEpisodes>, String> {
    let client = Client::new();

    // Step 1: Search for the show by name
    let search_url = format!("https://api.tvmaze.com/search/shows?q={}", anime_name);
    let search_response = client
        .get(&search_url)
        .send()
        .await
        .map_err(|e| format!("Failed to search show by name: {}", e))?;

    let search_json: Vec<TVmazeShow> = search_response
        .json()
        .await
        .map_err(|e| format!("Failed to parse search response: {}", e))?;

    // Check if any show was found
    let show_id = search_json.get(0).ok_or("No matching anime found.")?.id;

    // Step 2: Fetch episodes for the found show
    let episodes_url = format!("https://api.tvmaze.com/shows/{}/episodes", show_id);
    let episodes_response = client
        .get(&episodes_url)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch episodes: {}", e))?;

    let episodes_json: Vec<TVmazeEpisode> = episodes_response
        .json()
        .await
        .map_err(|e| format!("Failed to parse episodes response: {}", e))?;

    let mut seasons: Vec<SeasonedEpisodes> = vec![];
    let mut current_season_number = 0;
    let mut current_season = SeasonedEpisodes {
        season: 0,
        start_episode: 1,
        end_episode: 0,
        titles: vec![],
    };

    for episode in episodes_json {
        // Check if it's a new season
        if episode.season != current_season_number {
            if current_season_number != 0 {
                // Finalize the previous season and add it to the list
                current_season.end_episode = current_season.titles.len() as i32;
                seasons.push(current_season);
            }

            // Start a new season
            current_season_number = episode.season;
            current_season = SeasonedEpisodes {
                season: episode.season,
                start_episode: episode.number,
                end_episode: 0,
                titles: vec![],
            };
        }

        // Add episode title to the current season
        current_season.titles.push(episode.name);
    }

    // Add the last season to the list
    if !current_season.titles.is_empty() {
        current_season.end_episode = current_season.titles.len() as i32;
        seasons.push(current_season);
    }

    Ok(seasons)
}
