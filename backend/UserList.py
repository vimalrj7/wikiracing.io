from User import User

class UserList:
    
    def __init__(self):
        self.user_list = {}

    def get_user(self, sid):
        return self.user_list[sid]

    def add_user(self, user):
        if self.user_list == {}: user.admin = True 
        self.user_list[user.sid] = user

    def delete_user(self, sid):
        removed = self.user_list.pop(sid, None)
        if removed and removed.admin:
            for user in self.user_list:
                user.admin = True
                break
        return removed

    def export(self):
        return {sid: user.export() for sid, user in self.user_list.items()}