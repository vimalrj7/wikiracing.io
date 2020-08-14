import requests
import requests_cache
import json

requests_cache.install_cache()
    
class Page:

    def __init__(self, wikipage):
        print('SENDING REQ')
        url = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&page='+wikipage+'&redirects=1&prop=text%7Cdisplaytitle&disableeditsection=1&mobileformat=1&formatversion=2'
        r = requests.get(url)
        print('GOT REQUEST')
        print('From Cache: ', r.from_cache)
        json_data = r.json()

        print('PARSING')

        self.title = json_data['parse']['title']

        #self.html = top+self.title+middle+json_data['parse']['text']+bottom
        self.html = json_data['parse']['text']
        print('DONE')

    def export(self):
        return {'html': self.html, 'title': self.title}





    