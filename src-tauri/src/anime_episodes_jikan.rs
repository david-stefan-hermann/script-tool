use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::fmt;
use tauri::command;

// Struct to hold episode information
#[derive(Debug, Serialize, Deserialize)]
struct JikanEpisode {
    mal_id: i32,
    title: Option<String>,
}

// Struct to hold the response for episodes
#[derive(Debug, Serialize, Deserialize)]
struct JikanEpisodeResponse {
    data: Vec<JikanEpisode>,
}

// Struct to hold the search result response for finding anime by name
#[derive(Debug, Serialize, Deserialize)]
struct JikanSearchAnime {
    mal_id: i32,
}

#[derive(Debug, Serialize, Deserialize)]
struct JikanSearchResponse {
    data: Vec<JikanSearchAnime>,
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
pub async fn fetch_anime_episode_titles_grouped_by_season(
    anime_id: Option<i32>,
    anime_name: Option<String>,
    year: Option<i32>,
) -> Result<Vec<SeasonedEpisodes>, String> {
    let client = Client::new();
    let url: String;

    if let Some(id) = anime_id {
        url = format!("https://api.jikan.moe/v4/anime/{}/episodes", id);
    } else if let Some(name) = anime_name {
        let search_url = if let Some(year) = year {
            format!("https://api.jikan.moe/v4/anime?q={}&year={}", name, year)
        } else {
            format!("https://api.jikan.moe/v4/anime?q={}", name)
        };

        let search_response = client
            .get(&search_url)
            .send()
            .await
            .map_err(|e| format!("Failed to fetch anime by name: {}", e))?;

        let search_json: JikanSearchResponse = search_response
            .json()
            .await
            .map_err(|e| format!("Failed to parse search response: {}", e))?;

        let anime_id = search_json
            .data
            .get(0)
            .ok_or("No matching anime found.")?
            .mal_id;

        println!("Found anime ID: {}", anime_id);
        url = format!("https://api.jikan.moe/v4/anime/{}/episodes", anime_id);
    } else {
        return Err("You must provide either an anime ID or an anime name.".into());
    }

    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch episodes: {}", e))?;

    let raw_response = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response body: {}", e))?;
    println!("Raw Response: {}", raw_response);

    let response_json: JikanEpisodeResponse = serde_json::from_str(&raw_response)
        .map_err(|e| format!("Failed to parse episodes response: {}", e))?;

    // Use a reference to response_json.data to avoid moving it
    let episode_data = &response_json.data;

    let mut seasons = vec![];
    let mut current_season = SeasonedEpisodes {
        season: 1,
        start_episode: 1,
        end_episode: 0,
        titles: vec![],
    };

    for (i, episode) in episode_data.iter().enumerate() {
        if (i + 1) % 12 == 1 && i != 0 {
            current_season.end_episode = i as i32;
            seasons.push(current_season);
            current_season = SeasonedEpisodes {
                season: seasons.len() as i32 + 1,
                start_episode: i as i32 + 1,
                end_episode: 0,
                titles: vec![],
            };
        }

        current_season.titles.push(
            episode
                .title
                .clone()
                .unwrap_or_else(|| "Unknown Title".to_string()),
        );
    }

    current_season.end_episode = episode_data.len() as i32;
    seasons.push(current_season);

    println!("Grouped Episodes by Season: {:?}", seasons);

    Ok(seasons)
}
