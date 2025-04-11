import requests
from bs4 import BeautifulSoup as bs

def scrape_image_url(place_name: str) -> str:
    UNSPLASH_ACCESS_KEY = 'wwUl2Dfn40swqcD5kMynCfqhldh9O9Z2G6hVYXC-VuY'
    
    try:
        url = 'https://api.unsplash.com/search/photos'
        params = {
            'query': place_name,
            'per_page': 1
        }
        headers = {
            'Authorization': f'Client-ID {UNSPLASH_ACCESS_KEY}'
        }

        response = requests.get(url, params=params, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if data['results'] and len(data['results']) > 0:
                image_url = data['results'][0]['urls']['full']
                return image_url
            else:
                return None
        else:
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None


