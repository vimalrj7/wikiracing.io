from flask import Flask, render_template, request
from flask_socketio import SocketIO, send, join_room, leave_room, emit
from User import User
from UserList import UserList
from Room import Room
from Page import Page
from flask_cors import CORS, cross_origin
import requests
import requests_cache



app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0


rooms = {}

requests_cache.install_cache()

""" @app.route('/')
def index():
    return render_template('index.html')

@app.route('/play', methods=['GET'])
def play():
    return render_template('play.html')
 """

@socketio.on('join')
def on_join(data):
    print("Joining!")
    username = data['userName']
    room_code = data['roomCode']
    
    if username != '':
        user = User(username, request.sid, room_code)

        if room_code not in rooms:
            rooms[room_code] = Room()
        
        rooms[room_code].users.add_user(user)
        join_room(room_code)

        room_data = rooms[room_code].export()
        print(room_data)

        emit('updateRoom', room_data, broadcast=True, room=room_code)


@socketio.on('disconnect')
def on_leave():
    print('Disconnect!')

    for room in rooms.values():
        if room.users.delete_user(request.sid):
            room_code = room.users.user_list[request.sid].room
            break
    
    leave_room(room_code)
    room_data = rooms[room_code].export()
            
    emit('updateRoom', room_data, broadcast = True, room = room_code)


@socketio.on('startRound')
def start_game(data):
    print("Starting Game!")
    room_code = data['roomCode']

    room = rooms[room_code]

    room.start_game()

    room_data = room.export()
    emit('startRound', broadcast=True, room=room_code)

""" @socketio.on('updateRoom')
def update_room(data):
    print('Updating!')
    room_code = data['roomCode']
    room = rooms[room_code]

    room_data = room.export()
    print(room_data)

    emit('updateRoom', room_data, broadcast=True, room=room_code) """

@socketio.on('endGame')
def end_game(data):
    room_code = data['roomCode']
    room = rooms[room_code]

    room.end_game(request.sid)

    room_data = room.export()
    emit('endRound', broadcast=True, room=room_code)

""" @socketio.on('randomize')
def randomize(data):
    room_code = data['roomCode']
    room = rooms[room_code]

    room.refresh()

    emit('updateRoom', room_data, broadcast=True, room=room_code) """

@socketio.on('updatePage')
def get_wikipage(data):
    print('Updating PAGE!')
    room_code = data['roomCode']
    page_name = data['wikiPage']
    room = rooms[room_code]

    room.update_game(request.sid, page_name)

    page = Page(page_name).export()

    emit('updatePage', page)


@socketio.on('message')

def message(data):
    message = data['message']
    user_name = data['userName']
    room_code = data['roomCode']

    send(user_name+': '+message, broadcast=True, room=room_code)


if __name__ == '__main__':
    socketio.run(app, debug=True)

