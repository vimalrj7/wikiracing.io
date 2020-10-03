from random import sample
from data import emojis

class User:

    def __init__(self, username, sid, emoji):
        self.username = username
        self.sid = sid
        self.admin = False
        self.current_page = None
        self.clicks = -1 # Start game increments click by 1 to bring it to 0
        self.wins = 0
        self.time = 0
        self.emoji = emoji

    def export(self):
        return {'username': self.username,
                'sid': self.sid,
                'admin': self.admin,
                'current_page': self.current_page,
                'clicks': self.clicks,
                'wins': self.wins,
                'time': self.time,
                'emoji': self.emoji}
        
