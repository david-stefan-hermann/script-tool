use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::fmt;
use tauri::command;

// Struct to hold episode information
#[derive(Debug, Serialize, Deserialize)]
struct TVDBEpisode {
    aired_season: Option<i32>,         // Season number
    aired_episode_number: Option<i32>, // Episode number
    episode_name: Option<String>,      // Episode title
}

// Struct to hold the response for episodes
#[derive(Debug, Serialize, Deserialize)]
struct TVDBEpisodeResponse {
    data: Vec<TVDBEpisode>,
    links: TVDBLinks, // Pagination links
}

#[derive(Debug, Serialize, Deserialize)]
struct TVDBLinks {
    next: Option<i32>,
}

// Struct to hold search result for finding TV shows by name
#[derive(Debug, Serialize, Deserialize)]
struct TVDBSearchResult {
    id: i32,
    series_name: String,
}

// Struct for handling the search response
#[derive(Debug, Serialize, Deserialize)]
struct TVDBSearchResponse {
    data: Vec<TVDBSearchResult>,
}

// Struct for holding episodes grouped by season
#[derive(Debug, Serialize, Deserialize)]
pub struct SeasonedEpisodes {
    season: i32,
    start_episode: i32,
    end_episode: i32,
    titles: Vec<String>,
}

// Custom error type for error handling
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

// Command to fetch episode titles from TheTVDB
#[command]
pub async fn fetch_tvdb_episode_titles_grouped_by_season(
    tvdb_api_key: String,
    anime_id: Option<i32>,
    anime_name: Option<String>,
    year: Option<i32>,
) -> Result<Vec<SeasonedEpisodes>, String> {
    let client = Client::new();
    let url: String;

    // Search by show ID or name
    if let Some(id) = anime_id {
        url = format!("https://api.thetvdb.com/series/{}/episodes", id);
    } else if let Some(name) = anime_name {
        let search_url = if let Some(year) = year {
            format!("https://api.thetvdb.com/search/series?name={}&year={}", name, year)
        } else {
            format!("https://api.thetvdb.com/search/series?name={}", name)
        };

        let search_response = client
            .get(&search_url)
            .header("Authorization", format!("Bearer {}", tvdb_api_key))
            .send()
            .await
            .map_err(|e| format!("Failed to search show by name: {}", e))?;

        let search_json: TVDBSearchResponse = search_response
            .json()
            .await
            .map_err(|e| format!("Failed to parse search response: {}", e))?;

        let series_id = search_json
            .data
            .get(0)
            .ok_or("No matching show found.")?
            .id;

        println!("Found series ID: {}", series_id);
        url = format!("https://api.thetvdb.com/series/{}/episodes", series_id);
    } else {
        return Err("You must provide either a show ID or a show name.".into());
    }

    // Fetch episodes from TheTVDB
    let response = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", tvdb_api_key))
        .send()
        .await
        .map_err(|e| format!("Failed to fetch episodes: {}", e))?;

    let raw_response = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response body: {}", e))?;
    println!("Raw Response: {}", raw_response);

    // Parse the response
    let response_json: TVDBEpisodeResponse = serde_json::from_str(&raw_response)
        .map_err(|e| format!("Failed to parse episodes response: {}", e))?;

    // Extract episode data and log for debugging
    let episode_data = &response_json.data;

    if episode_data.is_empty() {
        println!("No episode data found.");
        return Ok(vec![]); // Return empty result if no data
    }

    println!("Number of episodes received: {}", episode_data.len());

    // Group episodes by season
    let mut seasons_map = std::collections::HashMap::new();

    for episode in episode_data.iter() {
        if let (Some(season), Some(episode_name)) = (episode.aired_season, &episode.episode_name) {
            // Log each episode being processed
            println!(
                "Processing episode: Season {} - Episode {} - {}",
                season,
                episode.aired_episode_number.unwrap_or(0),
                episode_name
            );

            // Add episode title to the corresponding season in the map
            let season_entry = seasons_map.entry(season).or_insert_with(|| SeasonedEpisodes {
                season,
                start_episode: 0,  // Not relevant for your current structure
                end_episode: 0,    // Not relevant for your current structure
                titles: vec![],
            });
            season_entry.titles.push(episode_name.clone());
        } else {
            println!("Skipping episode due to missing season or title.");
        }
    }

    // Convert HashMap to Vec<SeasonedEpisodes>
    let mut seasons: Vec<SeasonedEpisodes> = seasons_map.into_values().collect();
    seasons.sort_by_key(|s| s.season);  // Sort by season number

    println!("Grouped Episodes by Season: {:?}", seasons);

    if seasons.is_empty() {
        println!("No seasons or episodes were found.");
        return Err("No episodes found.".to_string());
    }

    Ok(seasons)
}
