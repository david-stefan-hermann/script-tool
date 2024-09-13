use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::fmt;
use tauri::command;

// Struct to hold episode information from TVMaze API
#[derive(Debug, Serialize, Deserialize)]
struct TVMazeEpisode {
    season: i32,
    number: i32,
    name: Option<String>,
    airdate: Option<String>,
}

// Struct to hold the search result response for finding anime by name
#[derive(Debug, Serialize, Deserialize, Clone)]
struct TVMazeShow {
    id: i32,
    name: String,
    premiered: Option<String>,
}

// Struct for the search response from TVMaze
#[derive(Debug, Serialize, Deserialize)]
struct TVMazeSearchResponse {
    show: TVMazeShow,
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
pub async fn fetch_tvmaze_episode_titles_grouped_by_season(
    anime_id: Option<i32>,
    anime_name: Option<String>,
    year: Option<i32>,
) -> Result<ShowDetailsWithEpisodes, String> {
    let client = Client::new();
    let url: String;
    let show_details: TVMazeShow;

    if let Some(id) = anime_id {
        // Fetch show details using the anime ID
        let show_url = format!("https://api.tvmaze.com/shows/{}", id);
        let show_response = client
            .get(&show_url)
            .send()
            .await
            .map_err(|e| format!("Failed to fetch show by ID: {}", e))?;
        show_details = show_response
            .json()
            .await
            .map_err(|e| format!("Failed to parse show details response: {}", e))?;

        // Fetch episodes using the anime ID
        url = format!("https://api.tvmaze.com/shows/{}/episodes", id);
    } else if let Some(name) = anime_name {
        // Search anime by name
        let search_url = format!("https://api.tvmaze.com/search/shows?q={}", name);
        let search_response = client
            .get(&search_url)
            .send()
            .await
            .map_err(|e| format!("Failed to search anime by name: {}", e))?;

        let search_json: Vec<TVMazeSearchResponse> = search_response
            .json()
            .await
            .map_err(|e| format!("Failed to parse search response: {}", e))?;

        // Filter the search results by year if a year is provided
        let filtered_result = if let Some(target_year) = year {
            search_json.into_iter().find(|result| {
                result
                    .show
                    .premiered
                    .as_ref()
                    .map_or(false, |p| p.starts_with(&target_year.to_string()))
            })
        } else {
            search_json.into_iter().next()
        };

        let found_show = filtered_result
            .ok_or_else(|| "No matching anime found.".to_string())?
            .show;

        show_details = found_show.clone();
        url = format!("https://api.tvmaze.com/shows/{}/episodes", found_show.id);
    } else {
        return Err("You must provide either an anime ID or an anime name.".into());
    }

    // Fetch episodes from TVMaze
    let episodes_response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch episodes: {}", e))?;

    let episodes_json: Vec<TVMazeEpisode> = episodes_response
        .json()
        .await
        .map_err(|e| format!("Failed to parse episodes response: {}", e))?;

    // Group episodes by season
    let mut seasons: Vec<SeasonedEpisodes> = vec![];
    let mut current_season: Option<SeasonedEpisodes> = None;

    for (i, episode) in episodes_json.iter().enumerate() {
        if let Some(season) = current_season.as_mut() {
            if season.season != episode.season {
                season.end_episode = (i + 1) as i32 - 1;
                seasons.push(season.clone());
                current_season = Some(SeasonedEpisodes {
                    season: episode.season,
                    start_episode: (i + 1) as i32,
                    end_episode: 0,
                    titles: vec![episode
                        .name
                        .clone()
                        .unwrap_or_else(|| "Unknown Title".to_string())],
                });
            } else {
                season.titles.push(
                    episode
                        .name
                        .clone()
                        .unwrap_or_else(|| "Unknown Title".to_string()),
                );
            }
        } else {
            current_season = Some(SeasonedEpisodes {
                season: episode.season,
                start_episode: (i + 1) as i32,
                end_episode: 0,
                titles: vec![episode
                    .name
                    .clone()
                    .unwrap_or_else(|| "Unknown Title".to_string())],
            });
        }
    }

    if let Some(mut season) = current_season {
        season.end_episode = episodes_json.len() as i32;
        seasons.push(season);
    }

    // Return show details with grouped episodes
    Ok(ShowDetailsWithEpisodes {
        id: show_details.id,
        name: show_details.name,
        premiered_year: show_details
            .premiered
            .as_ref()
            .map(|p| p.split('-').next().unwrap_or("").to_string()),
        episodes_by_season: seasons,
    })
}
