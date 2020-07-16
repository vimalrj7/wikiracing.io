import random
from User import User
from UserList import UserList

class Game:

    def __init__(self, users):
        self.start_page = choose_start()
        self.target_page = choose_target()
        self.users = users
        
    def choose_start(self):
        pages = ['Lionel_Messi', 'Cristiano_Ronaldo', 'Canada', 'NBA']
        self.start_page = random.choice(pages)
        
    
    def choose_target(self):
        pages = ['Lionel_Messi', 'Cristiano_Ronaldo', 'Canada', 'NBA']
        while self.target_page != self.start_page:
            self.target_page = random.choice(pages)
    
    def start_game(self):
        for user in users.user_list:
            user.clicks = 0
            user.current_page = None

        #what else to start game?

    def update_game(self, sid, page):
        user = users.get_user(sid)
        user.current_page = page

        if user.current_page == self.target_page:
            end_game()
        else:
            user.clicks += 1

    def end_game(self, sid):
        winner = users.get_user(sid)
        winner.wins += 1
        
        #anything else

        self.start_game()

    def export(self):
        return {'start_page': self.start_page, 
                'target_page': self.target_page,
                'users': self.users.export()}

