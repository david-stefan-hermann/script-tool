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

// Struct to hold anime search result
#[derive(Debug, Serialize, Deserialize, Clone)]
struct JikanSearchAnime {
    mal_id: i32,
    title: String,
    aired: Aired,
}

// Struct to hold aired information (for start year)
#[derive(Debug, Serialize, Deserialize, Clone)]
struct Aired {
    from: Option<String>,
}

// Struct for the search response from Jikan
#[derive(Debug, Serialize, Deserialize)]
struct JikanSearchResponse {
    data: Vec<JikanSearchAnime>,
}

// Struct to hold episodes grouped by season
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SeasonedEpisodes {
    season: i32, // Season number
    start_episode: i32,
    end_episode: i32,
    titles: Vec<String>,
}

// Struct to hold show details along with episodes
#[derive(Debug, Serialize, Deserialize)]
pub struct ShowDetailsWithEpisodes {
    id: i32,
    name: String,
    premiered_year: Option<String>,
    episodes_by_season: Vec<SeasonedEpisodes>,
}

// Custom error type for better error handling
#[derive(Debug)]
pub enum FetchError {
    RequestError(reqwest::Error),
    ParsingError(serde_json::Error),
    //NotFoundError(String),
}

impl fmt::Display for FetchError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            FetchError::RequestError(err) => write!(f, "Request Error: {}", err),
            FetchError::ParsingError(err) => write!(f, "Parsing Error: {}", err),
            //FetchError::NotFoundError(message) => write!(f, "Not Found Error: {}", message),
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
pub async fn fetch_jikan_show_details(
    anime_id: Option<i32>,
    anime_name: Option<String>,
    year: Option<i32>,
) -> Result<ShowDetailsWithEpisodes, String> {
    let client = Client::new();
    let url: String;
    let anime_details: JikanSearchAnime;

    if let Some(id) = anime_id {
        // Fetch anime details using the anime ID
        let anime_url = format!("https://api.jikan.moe/v4/anime/{}", id);
        let anime_response = client
            .get(&anime_url)
            .send()
            .await
            .map_err(|e| format!("Failed to fetch anime by ID: {}", e))?;
        anime_details = anime_response
            .json()
            .await
            .map_err(|e| format!("Failed to parse anime details response: {}", e))?;

        // Fetch episodes using the anime ID
        url = format!("https://api.jikan.moe/v4/anime/{}/episodes", id);
    } else if let Some(name) = anime_name {
        // Search anime by name
        let search_url = if let Some(year) = year {
            format!("https://api.jikan.moe/v4/anime?q={}&start_date={}", name, year)
        } else {
            format!("https://api.jikan.moe/v4/anime?q={}", name)
        };

        let search_response = client
            .get(&search_url)
            .send()
            .await
            .map_err(|e| format!("Failed to search anime by name: {}", e))?;

        // Parse the search response and handle errors
        let search_json: JikanSearchResponse = search_response
            .json()
            .await
            .map_err(|e| format!("Failed to parse search response: {}", e))?;

        // Ensure we have at least one result
        if search_json.data.is_empty() {
            return Err("No matching anime found.".to_string());
        }

        anime_details = search_json.data[0].clone(); // Take the first result from the search

        println!("Found anime ID: {}", anime_details.mal_id);
        url = format!("https://api.jikan.moe/v4/anime/{}/episodes", anime_details.mal_id);
    } else {
        return Err("You must provide either an anime ID or an anime name.".into());
    }

    // Fetch episodes from Jikan
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

    // Extract the premiered year from the anime details
    let premiered_year = anime_details.aired.from.as_ref().map(|from| {
        from.split('-').next().unwrap_or("").to_string()
    });

    // Return show details with grouped episodes
    Ok(ShowDetailsWithEpisodes {
        id: anime_details.mal_id,
        name: anime_details.title,
        premiered_year,
        episodes_by_season: seasons,
    })
}
