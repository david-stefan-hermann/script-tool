use reqwest::Client;
use std::collections::HashMap;
use std::fmt;
use tauri::command;

use crate::api::models::{
    JikanAnimeDetailsResponse, JikanAnimeDetailsWrapper, JikanEpisodeResponse, JikanSearchResponse,
    SeasonedEpisodes, ShowDetailsWithEpisodes,
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
        // Fetch anime details by ID
        println!("Fetching anime details by ID: {}", id);
        let anime_url = format!("https://api.jikan.moe/v4/anime/{}", id);
        let anime_response = client
            .get(&anime_url)
            .send()
            .await
            .map_err(|e| format!("Failed to fetch anime by ID: {}", e))?;

        let response_text = anime_response
            .text()
            .await
            .map_err(|e| format!("Failed to read response body: {}", e))?;
        println!("Anime Response Body: {}", response_text);

        let anime_json: JikanAnimeDetailsWrapper = serde_json::from_str(&response_text)
            .map_err(|e| format!("Failed to parse anime details response: {}", e))?;
        anime_details = anime_json.data.clone();

        // Proceed to fetch episodes
        url = format!(
            "https://api.jikan.moe/v4/anime/{}/episodes",
            anime_details.mal_id
        );
    } else if let Some(name) = anime_name {
        // Search anime by name
        println!("Searching anime by name: {}", name);
        let search_url = format!("https://api.jikan.moe/v4/anime?q={}", name);
        let search_response = client
            .get(&search_url)
            .send()
            .await
            .map_err(|e| format!("Failed to search anime by name: {}", e))?;

        let search_json: JikanSearchResponse = search_response
            .json()
            .await
            .map_err(|e| format!("Failed to parse search response: {}", e))?;

        // Ensure we have results
        if search_json.data.is_empty() {
            return Err("No matching anime found.".to_string());
        }

        // Filter by year if provided
        let filtered_anime = if let Some(search_year) = year {
            search_json.data.iter().find(|anime| {
                anime
                    .aired
                    .from
                    .as_ref()
                    .map_or(false, |from| from.starts_with(&search_year.to_string()))
            })
        } else {
            // No year provided, fallback to the first result
            search_json.data.first()
        };

        if let Some(anime_details_json) = filtered_anime {
            let anime_id_from_search = anime_details_json.mal_id;
            println!("Found anime ID: {} for name {}", anime_id_from_search, name);

            let anime_url = format!("https://api.jikan.moe/v4/anime/{}", anime_id_from_search);
            let anime_response =
                client.get(&anime_url).send().await.map_err(|e| {
                    format!("Failed to fetch anime by ID from search result: {}", e)
                })?;

            let response_text = anime_response
                .text()
                .await
                .map_err(|e| format!("Failed to read response body: {}", e))?;
            println!("Anime Response Body from Search Result: {}", response_text);

            let anime_json: JikanAnimeDetailsWrapper = serde_json::from_str(&response_text)
                .map_err(|e| {
                    format!(
                        "Failed to parse anime details response from search result: {}",
                        e
                    )
                })?;

            anime_details = anime_json.data.clone();

            url = format!(
                "https://api.jikan.moe/v4/anime/{}/episodes",
                anime_details.mal_id
            );
        } else {
            return Err("No matching anime found with the given year.".to_string());
        }
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

    // Group episodes by release year (extracted from aired field)
    let mut seasons_map: HashMap<i32, SeasonedEpisodes> = HashMap::new();
    for (i, episode) in response_json.data.iter().enumerate() {
        let aired_date = episode
            .aired
            .clone()
            .unwrap_or_else(|| "Unknown".to_string());

        let year: i32 = aired_date
            .split('-')
            .next()
            .unwrap_or("0")
            .parse()
            .unwrap_or(0);

        let season = seasons_map.entry(year).or_insert_with(|| SeasonedEpisodes {
            season: year,
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
    seasons.sort_by(|a, b| a.season.cmp(&b.season));

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
