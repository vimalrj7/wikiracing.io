from random import choice
from User import User
from data import pages
import time


class Room:

    def __init__(self, room_code):
        self.users = {}
        self.room_code = room_code
        self.emojis = set()
        self.start_page, self.target_page = choice(pages)
        self.rounds = 1
        #self.round_end = False
        #self.winner = None
        #self.lowest_position = 0
    
    #USER METHODS
    def get_user(self, sid):
        return self.users[sid]

    def add_user(self, username, sid):
        if sid not in self.users:
            #Creates user and adds to room
            self.users[sid] = User(username, sid)
            
            #Generates unique emoji for user and adds it used emojis for room
            self.emojis.add(self.users[sid].set_emoji(self.emojis))
            
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

    def start_game(self):
        print('Starting game internally!')
        print(self.export())

        #self.round_end = False

        #Resets relevant user statistics for next round
        for user in self.users.values():
            user.clicks = -1
            user.current_page = self.start_page

    def update_game(self, sid, page):
        user = self.get_user(sid)
        user.current_page = page
        print('Updating Game Internally')
        print(user.username, '+' ,user.current_page)

        user.clicks += 1

        if user.current_page.lower() == self.target_page.lower():
            return self.end_game(sid)

    def end_game(self, sid):
        print('Ending game internally, flag changed')
        #self.round_end = True
        completer = self.get_user(sid)
        completer.wins += 1
        self.rounds += 1
        self.start_page, self.target_page = choice(pages)

        ###
        '''
        completer.position = self.lowest_position + 1
        self.lowest_position = completer.position
        completer.score = (4 - completer.position) * 10
        
        if completer.position == 1:
            completer.wins += 1
        
        if completer.position == 3 or completer.position == len(self.users):
            self.rounds += 1
            self.lowest_position = 0
            self.randomize_pages()
        '''
        ###
        
        print(completer)

        return completer

    def export(self):
        return {'start_page': self.start_page,
                'target_page': self.target_page,
                'room_code': self.room_code,
                'rounds': self.rounds,
                'users': {sid: user.export() for sid, user in self.users.items()}}



#