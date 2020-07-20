class User:

    def __init__(self, username, sid, room):
        self.username = username
        self.sid = sid
        self.room = room
        self.admin = False
        self.current_page = None
        self.clicks = 0
        self.wins = 0

    def export(self):
        return {'username': self.username,
                'sid': self.sid,
                'room': self.room,
                'admin': self.admin,
                'current_page': self.current_page,
                'clicks': self.clicks,
                'wins': self.wins}
        
