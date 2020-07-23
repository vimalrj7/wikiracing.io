import requests
import requests_cache
import json

requests_cache.install_cache()
top = '''<body><link
      rel="stylesheet"
      href="https://en.wikipedia.org/w/load.php?lang=en&amp;modules=site.styles&amp;only=styles&amp;skin=vector"
    />
    <link
      rel="stylesheet"
      href="https://en.wikipedia.org/w/load.php?lang=en&amp;modules=ext.cite.styles%7Cext.uls.interlanguage%7Cext.visualEditor.desktopArticleTarget.noscript%7Cext.wikimediaBadges%7Cmediawiki.toc.styles%7Cskins.vector.styles.legacy%7Cwikibase.client.init&amp;only=styles&amp;skin=vector"
    />


   <div class="mediawiki ltr sitedir-ltr mw-hide-empty-elt ns-0 ns-subject mw-editables skin-vector action-view skin-vector-legacy minerva--history-page-action-enabled">
      <div id="content" class="mw-body-content" role="main">
        <div id="content" class="mw-body" role="main">
          <h1 id="firstHeading" class="firstHeading" lang="en">
    '''

middle = '''</h1>
          <div id="bodyContent" class="mw-body-content"></div>
            <div id="siteSub" class="noprint">
              From Wikipedia, the free encyclopedia
            </div>
            <div id="contentSub"></div>
            <div
              id="mw-content-text"
              lang="en"
              dir="ltr"
              class="mw-content-ltr">
        '''

bottom = '''
        </div>
          </div>
        </div>
      </div>
    </div>
  </body>
    '''
class Page:

    def __init__(self, wikipage):
        url = 'https://en.wikipedia.org//w/api.php?action=parse&format=json&page='+wikipage+'&prop=text%7Cdisplaytitle&disablelimitreport=1&disableeditsection=1&formatversion=2'
        r = requests.get(url)
        print('From Cache: ', r.from_cache)
        json_data = r.json()

        self.title = json_data['parse']['title']

        self.html = top+self.title+middle+json_data['parse']['text']+bottom

    def export(self):
        return {'html': self.html}





    