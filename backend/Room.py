from random import choice, sample
from User import User
from data import pages, emojis
import time

ROOM_LIMIT = 8

class Room:

    def __init__(self, room_code):
        self.users = {}
        self.room_code = room_code
        self.emojis = sample(emojis, ROOM_LIMIT)
        self.start_page, self.target_page = choice(pages)
        self.rounds = 1
    
    #USER METHODS
    def get_user(self, sid):
        return self.users[sid]

    def add_user(self, username, sid):
        if sid not in self.users: 
            #Creates user and adds to room
            self.users[sid] = User(username, sid, self.emojis.pop())
            
            #Makes user admin if first in room
            if len(self.users) == 1: 
                self.users[sid].admin = True

    def delete_user(self, sid):
        #Deletes user from room
        removed = self.users.pop(sid, None)

        #If people still in room, makes second person admin
        if removed and removed.admin and self.users:
            self.users[next(iter(self.users))].admin = True
            
        return removed

    #ROOM METHODS
    def randomize_pages(self):
        self.start_page, self.target_page = choice(pages)

    def is_room_full(self):
        return True if len(self.users) >= ROOM_LIMIT else False 

    def start_game(self):
        #Resets relevant user statistics for next round
        for user in self.users.values():
            user.clicks = -1
            user.current_page = self.start_page

    def update_game(self, sid, page):
        user = self.get_user(sid)
        user.current_page = page
        user.clicks += 1

        if user.current_page.lower() == self.target_page.lower():
            return self.end_game(sid)

    def end_game(self, sid):
        completer = self.get_user(sid)
        completer.wins += 1
        self.rounds += 1
        self.randomize_pages()

        return completer

    def export(self):
        return {'start_page': self.start_page,
                'target_page': self.target_page,
                'room_code': self.room_code,
                'rounds': self.rounds,
                'users': {sid: user.export() for sid, user in self.users.items()}}