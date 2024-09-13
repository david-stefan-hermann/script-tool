use reqwest::Client;
use std::collections::HashMap;
use std::fmt;
use tauri::command;

use crate::api::models::{
    JikanAnimeDetailsResponse, JikanAnimeDetailsWrapper, JikanEpisodeResponse,
    JikanSearchResponse, SeasonedEpisodes, ShowDetailsWithEpisodes,
};

// Custom error type for better error handling
#[derive(Debug)]
pub enum FetchError {
    RequestError(reqwest::Error),
    ParsingError(serde_json::Error),
}

impl fmt::Display for FetchError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            FetchError::RequestError(err) => write!(f, "Request Error: {}", err),
            FetchError::ParsingError(err) => write!(f, "Parsing Error: {}", err),
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
    let anime_details: JikanAnimeDetailsResponse;

    if let Some(id) = anime_id {
        // Debug: Log fetching by ID
        println!("Fetching anime details by ID: {}", id);

        // Fetch anime details using the anime ID
        let anime_url = format!("https://api.jikan.moe/v4/anime/{}", id);
        let anime_response = client
            .get(&anime_url)
            .send()
            .await
            .map_err(|e| format!("Failed to fetch anime by ID: {}", e))?;

        // Read and print the raw response body for debugging
        let response_text = anime_response
            .text()
            .await
            .map_err(|e| format!("Failed to read response body: {}", e))?;
        println!("Anime Response Body: {}", response_text);

        // Deserialize the response into `JikanAnimeDetailsWrapper` struct
        let anime_json: JikanAnimeDetailsWrapper = serde_json::from_str(&response_text)
            .map_err(|e| format!("Failed to parse anime details response: {}", e))?;

        // Extract `anime_details` from the `data` field
        anime_details = anime_json.data.clone();

        // Debug: Check if `anime_details` is parsed correctly
        println!("Parsed Anime Details: {:?}", anime_details);

        // Now that we have anime details, fetch the episodes by season
        url = format!(
            "https://api.jikan.moe/v4/anime/{}/episodes",
            anime_details.mal_id
        );
    } else if let Some(name) = anime_name {
        // Debug: Log searching by name
        println!("Searching anime by name: {}", name);

        // Search anime by name
        let search_url = if let Some(year) = year {
            format!(
                "https://api.jikan.moe/v4/anime?q={}&start_date={}",
                name, year
            )
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

        // Fetch anime details using the anime ID from the search result
        let anime_id_from_search = search_json.data[0].mal_id;
        let anime_url = format!("https://api.jikan.moe/v4/anime/{}", anime_id_from_search);
        let anime_response = client
            .get(&anime_url)
            .send()
            .await
            .map_err(|e| format!("Failed to fetch anime by ID from search result: {}", e))?;

        // Read and print the raw response body for debugging
        let response_text = anime_response
            .text()
            .await
            .map_err(|e| format!("Failed to read response body: {}", e))?;
        println!("Anime Response Body from Search Result: {}", response_text);

        // Deserialize the response into `JikanAnimeDetailsWrapper` struct
        let anime_json: JikanAnimeDetailsWrapper = serde_json::from_str(&response_text)
            .map_err(|e| format!("Failed to parse anime details response from search result: {}", e))?;

        // Extract `anime_details` from the `data` field
        anime_details = anime_json.data.clone();

        println!("Found anime ID: {}", anime_details.mal_id);
        url = format!(
            "https://api.jikan.moe/v4/anime/{}/episodes",
            anime_details.mal_id
        );
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

    // Group episodes by release year (extracted from aired

    // Group episodes by release year (extracted from aired field)
    let mut seasons_map: HashMap<i32, SeasonedEpisodes> = HashMap::new();
    for (i, episode) in response_json.data.iter().enumerate() {
        let aired_date = episode
            .aired
            .clone()
            .unwrap_or_else(|| "Unknown".to_string());

        // Parse the year as i32 from the aired date
        let year: i32 = aired_date
            .split('-')
            .next()
            .unwrap_or("0") // Use "0" as default if the date is missing or malformed
            .parse()
            .unwrap_or(0); // Convert to i32, default to 0 if parsing fails

        // Get or create the season based on year
        let season = seasons_map
            .entry(year) // Using year as i32 key
            .or_insert_with(|| SeasonedEpisodes {
                season: year, // Store as i32 instead of String
                start_episode: i as i32 + 1,
                end_episode: 0,
                titles: vec![],
            });

        season.titles.push(
            episode
                .title
                .clone()
                .unwrap_or_else(|| "Unknown Title".to_string()),
        );
        season.end_episode = i as i32 + 1;
    }

    // Convert the HashMap to a Vec of SeasonedEpisodes
    let mut seasons: Vec<SeasonedEpisodes> = seasons_map.into_values().collect();
    seasons.sort_by(|a, b| a.season.cmp(&b.season)); // Sort by the year for consistency

    println!("Grouped Episodes by Release Year: {:?}", seasons);

    // Extract the premiered year from the anime details
    let premiered_year = anime_details.aired.as_ref().and_then(|aired| {
        aired
            .from
            .as_ref()
            .map(|from| from.split('-').next().unwrap_or("").to_string())
    });

    // Return show details with grouped episodes
    Ok(ShowDetailsWithEpisodes {
        id: anime_details.mal_id,
        name: anime_details.title,
        premiered_year,
        episodes_by_season: seasons,
    })
}
