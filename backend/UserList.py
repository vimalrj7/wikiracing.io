from User import User

class UserList:
    
    def __init__(self, user_list = {}, room_list = []):
        self.user_list = user_list
        self.room_list = room_list

    def get_user(self, sid):
        return self.user_list[sid]

    def add_user(self, user):
        user.admin = False if user.room in self.room_list else True
        self.user_list[user.sid] = user
        if user.admin:
            self.room_list.append(user.room)

    def delete_user(self, sid):
        removed = self.user_list.pop(sid)

        #if admin is being removed make next person admin
        if removed.admin:
            for user in self.user_list:
                if self.user_list[user].room == removed.room:
                    self.user_list[user].admin = True
                    break
        
        #if no more people left in room, delete room from room list
        if removed.room not in [user.room for user in self.user_list.values()]:
            self.room_list.remove(removed.room)

        return removed

    def get_room_users(self, room, json = False):
        if json:
            return {sid: user.export() for sid, user in self.user_list.items() if user.room == room}
        return UserList({sid: user for sid, user in self.user_list.items() if user.room == room}, self.room_list)

    def export(self):
        return {sid: user.export() for sid, user in self.user_list.items()}