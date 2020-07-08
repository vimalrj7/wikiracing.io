class UserDB:

    def __init__(self):
        self.user_list = {}
        self.room_list = []

    def __str__(self):
        database = 'User List:\n'+str(self.user_list)+'\nRooms:\n'+str(self.room_list)
        return database

    def add_user(self, SID, username, room):
        admin = False if room in self.room_list else True
        self.user_list[SID] = {'sid': SID, 'username': username, 'room': room, 'admin': admin}
        if admin:
            self.room_list.append(room)

    def delete_user(self, SID):
        removed = self.user_list.pop(SID)

        #if admin is being removed make next person admin
        if removed['admin']:
            for user in self.user_list:
                if self.user_list[user]['admin'] and self.user_list[user]['room'] == removed['room']:
                    self.user_list['admin'] = True
                    break
        
        #if no more people left in room, delete room from room list
        if removed['room'] not in [user['room'] for user in self.user_list.values()]:
            self.room_list.remove(removed['room'])

        return removed

    def get_room_users(self, room):
        return {SID: user for SID, user in self.user_list.items() if user['room'] == room}
    def get_rooms(self):
        rooms = {room: [] for room in self.room_list}
        for user in self.user_list.values():
            rooms[user['room']].append(user['username'])
        return rooms

