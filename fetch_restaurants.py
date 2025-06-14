import requests
from typing import List, Dict, Any


def fetch_restaurants(api_key: str, latitude: float, longitude: float,
                      genres: List[str], radius: int = 1,
                      limit: int = 20) -> List[Dict[str, Any]]:
    """Fetch restaurants from Tabelog search API.

    Parameters
    ----------
    api_key : str
        Tabelog API key.
    latitude : float
        Latitude value.
    longitude : float
        Longitude value.
    genres : List[str]
        List of genre keywords. Example: ["\u548c\u98df", "\u934b\u6599\u7406"]
    radius : int, optional
        Search radius in kilometers (1-5), by default 1.
    limit : int, optional
        Maximum number of results to return, by default 20.

    Returns
    -------
    List[Dict[str, Any]]
        List of restaurant dictionaries with selected fields.

    Raises
    ------
    requests.RequestException
        If an HTTP error or timeout occurs.
    RuntimeError
        If the API response status code is not 200.
    """

    params = {
        "keyid": api_key,
        "lat": latitude,
        "lng": longitude,
        "range": radius,
        "genre": ",".join(genres),
        "offset": 0,
        "limit": limit,
    }

    try:
        response = requests.get(
            "https://api.tabelog.com/rs/v3/search/restaurants",
            params=params,
            timeout=10,
        )
        if response.status_code != 200:
            raise RuntimeError(
                f"API request failed with status code {response.status_code}" )
    except requests.RequestException as exc:
        # Propagate request-related exceptions (timeouts, connection errors, etc.)
        raise exc

    data = response.json()
    restaurants = data.get("restaurants", [])

    result: List[Dict[str, Any]] = []
    for item in restaurants:
        result.append(
            {
                "name": item.get("name"),
                "genre": item.get("genre"),
                "rating": item.get("rating"),
                "address": item.get("address"),
                "url": item.get("url"),
            }
        )
    return result

