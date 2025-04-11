import requests
from bs4 import BeautifulSoup

def get_image_url(query):
    search_url = f"https://www.bing.com/images/search?q={query.replace(' ', '+')}"
    headers = {"User-Agent": "Mozilla/5.0"}

    response = requests.get(search_url, headers=headers)
    if response.status_code != 200:
        return None
    
    soup = BeautifulSoup(response.text, "html.parser")
    img_tag = soup.find("a", class_="iusc") 
    
    if img_tag:
        murl = img_tag.get("m")
        if murl:
            import json
            murl_data = json.loads(murl)
            return murl_data.get("murl") 
    
    return None

def scrape_images(objects):
    for obj in objects:
        obj["img"] = get_image_url(obj["name"]) 
    
    return objects
