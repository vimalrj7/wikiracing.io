import random

class User:

    def __init__(self, username, sid):
        with open('emojis.txt', 'r') as avatars:
            avatars = avatars.readlines()

        self.username = username
        self.sid = sid
        self.admin = False
        self.current_page = None
        self.clicks = -1
        self.wins = 0
        self.time = 0
        ###
        self.position = 0
        self.score = 0
        ###
        self.emoji = random.choice(avatars).replace('\n','')

    def export(self):
        return {'username': self.username,
                'sid': self.sid,
                'admin': self.admin,
                'current_page': self.current_page,
                'clicks': self.clicks,
                'wins': self.wins,
                'time': self.time,
                'emoji': self.emoji}
        
