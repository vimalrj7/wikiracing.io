import random
from User import User
from UserList import UserList



class Room:

    def __init__(self):
        #maybe we can set up the list in the page class 
        #and actually get the html here instead of the list
        self.pages = ['Lionel_Messi', 'Cristiano_Ronaldo', 'Canada']
        self.start_page = random.choice(self.pages)
        self.target_page = random.choice(self.pages)
        self.users = {}
    
    #USER METHODS
    def get_user(self, sid):
        return self.users[sid]

    def add_user(self, user):
        if self.users == {}: user.admin = True 
        self.users[user.sid] = user

    def delete_user(self, sid):
        removed = self.users.pop(sid, None)
        if removed and removed.admin:
            users[next(iter(self.users))].admin = True
        return removed

    #ROOM METHODS
    def start_game(self):
        for user in self.users.users.values():
            user.clicks = 0
            user.current_page = None

        #what else to start game?

    def update_game(self, sid, page):
        user = self.users.get_user(sid)
        user.current_page = page

        if user.current_page == self.target_page:
            self.end_game(sid)
        else:
            user.clicks += 1

    def end_game(self, sid):
        winner = self.users.get_user(sid)
        winner.wins += 1
        
        #anything else

        self.start_game()

    def export(self):
        return {'start_page': self.start_page,      #add exports and conver to Page class
                'target_page': self.target_page,
                'users': {sid: user.export() for sid, user in self.users.items()}}