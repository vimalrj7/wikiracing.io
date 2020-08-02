class User:

    def __init__(self, username, sid):
        self.username = username
        self.sid = sid
        self.admin = False
        self.current_page = None
        self.clicks = -1
        self.wins = 0

    def export(self):
        return {'username': self.username,
                'sid': self.sid,
                'admin': self.admin,
                'current_page': self.current_page,
                'clicks': self.clicks,
                'wins': self.wins}
        
