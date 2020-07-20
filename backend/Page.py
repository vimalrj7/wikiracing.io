import requests
import requests_cache
import json

requests_cache.install_cache()

class Page:

    def __init__(self, wikipage):
        url = 'https://en.wikipedia.org//w/api.php?action=parse&format=json&page='+wikipage+'&prop=text%7Cdisplaytitle&disablelimitreport=1&disableeditsection=1&formatversion=2'
        r = requests.get(url)
        print('From Cache: ', r.from_cache)
        json_data = r.json()
        
        self.html = json_data['parse']['text'].replace('a href', 'Link to')
        self.title = json_data['parse']['title']



page = Page('Soup')

with open('pagehtml2.html', 'w', encoding='utf-8') as f:
    f.write(page.html)



    