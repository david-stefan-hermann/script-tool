use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::command;
use std::fmt;

// Struct to hold episode information
#[derive(Debug, Serialize, Deserialize)]
struct JikanEpisode {
    mal_id: i32,
    title: Option<String>,
}

// Struct to hold the response for episodes (data is nested inside the "data" key)
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
pub async fn fetch_anime_episode_titles(
    anime_id: Option<i32>, 
    anime_name: Option<String>,  // Anime name is optional now
    year: Option<i32>,           // Optionally include year for better search
) -> Result<Vec<String>, String> {
    let client = Client::new();
    let url: String;

    if let Some(id) = anime_id {
        // Fetch by anime ID directly
        url = format!("https://api.jikan.moe/v4/anime/{}/episodes", id);
    } else if let Some(name) = anime_name {
        // Search for the anime by name (with optional year for filtering)
        let search_url = if let Some(year) = year {
            format!("https://api.jikan.moe/v4/anime?q={}&year={}", name, year)
        } else {
            format!("https://api.jikan.moe/v4/anime?q={}", name)
        };
        
        let search_response = client.get(&search_url)
            .send()
            .await
            .map_err(|e| format!("Failed to fetch anime by name: {}", e))?;

        let search_json: JikanSearchResponse = search_response.json()
            .await
            .map_err(|e| format!("Failed to parse search response: {}", e))?;
        
        // Extract the first matching anime ID (mal_id)
        let anime_id = search_json.data.get(0)
            .ok_or("No matching anime found.")?
            .mal_id;

        println!("Found anime ID: {}", anime_id);  // Debugging output
        url = format!("https://api.jikan.moe/v4/anime/{}/episodes", anime_id);
    } else {
        return Err("You must provide either an anime ID or an anime name.".into());
    }

    // Fetch episodes from Jikan API
    let response = client.get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch episodes: {}", e))?;

    // Log the raw response for debugging
    let raw_response = response.text().await.map_err(|e| format!("Failed to read response body: {}", e))?;
    println!("Raw Response: {}", raw_response);  // Log the raw JSON response

    // Parse the response (now checking "data" field)
    let response_json: JikanEpisodeResponse = serde_json::from_str(&raw_response)
        .map_err(|e| format!("Failed to parse episodes response: {}", e))?;

    // Extract and log the episode titles
    let episode_titles: Vec<String> = response_json
        .data
        .into_iter()
        .map(|episode| episode.title.unwrap_or_else(|| "Unknown Title".to_string()))
        .collect();
    
    println!("Fetched Episode Titles: {:?}", episode_titles);  // Debugging output

    Ok(episode_titles)
}
