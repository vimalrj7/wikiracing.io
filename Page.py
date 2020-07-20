import requests
import requests_cache
import json

class Page:

    def __init__(self, wikipage):
        url = 'https://en.wikipedia.org//w/api.php?action=parse&format=json&page='+wikipage+'&prop=text%7Cdisplaytitle&disablelimitreport=1&disableeditsection=1&formatversion=2'
        r = requests.get(url)
        print('From Cache:', r.from_cache)
        json_data = r.json()
        
        self.html = json_data['parse']['text']
        self.title = json_data['parse']['title']



page = Page('Soup')

with open('pagehtml.html', 'w') as f:
    f.write(page.html)



    