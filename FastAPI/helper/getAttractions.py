import requests
from bs4 import BeautifulSoup

def google_scrape(query, num_results=30):
    search_url = f"https://www.google.com/search?q={query}+best+tourist+attractions&num={num_results}"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}

    response = requests.get(search_url, headers=headers)
    if response.status_code != 200:
        print("Blokiran pristup Google-u 😢")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    results = []

    for g in soup.find_all("div", class_="jhtnKe"):
        title = g.find("h3").text if g.find("h3") else "N/A"
        link = g.find("a")["href"] if g.find("a") else "N/A"
        
        image_tag = g.find("img")
        image_url = image_tag["src"] if image_tag else "N/A"
        
        results.append({
            "title": title,
            "link": link,
            "image_url": image_url
        })

    return results[:num_results]
