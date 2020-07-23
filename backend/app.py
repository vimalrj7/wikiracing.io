from flask import Flask, render_template, request
from flask_socketio import SocketIO, send, join_room, leave_room, emit
from User import User
from UserList import UserList
from Game import Game
from Page import Page
from flask_cors import CORS, cross_origin
import requests
import requests_cache



app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0


db = UserList()
games = {}

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
    room = data['roomCode']
    join_room(room)

    user = User(username, request.sid, room)
    db.add_user(user)

    if room not in games:
        games[room] = Game(db.get_room_users(room))

    print('FLAG', db.get_room_users(room))

    room_data = db.get_room_users(room, json=True)

    emit('updateUsers', room_data, broadcast = True, room = room)
    emit('updateGame', game_data, broadcast=True, room=room)

    print(db.export())

@socketio.on('disconnect')
def on_leave():
    print('Disconnect!')
    user = db.delete_user(request.sid)
    room = user.room
    room_data = db.get_room_users(room)

    emit('updateUsers', room_data, broadcast = True, room = room)
    
    print(db.export())


@socketio.on('startGame')
def start_game(data):
    room = data['roomCode']
    game = games[room]

    game.start_game()

    game_data = game.export()
    emit('updateGame', game_data, broadcast=True, room=room)

@socketio.on('updateGame')
def update_game(data):
    room = data['roomCode']
    #page = data['page']
    game = games[room]

    game.update_game(request.sid)

    game_data = game.export()
    print(game_data)
    emit('updateGame', game_data, broadcast=True, room=room)

@socketio.on('endGame')
def end_game(data):
    room = data['roomCode']
    game = games[room]

    game.end_game(request.sid)

    game_data = game.export()
    emit('updateGame', game_data, broadcast=True, room=room)

@socketio.on('randomize')
def randomize(data):
    room = data['roomCode']
    game = games[room]

    game.refresh()

    emit('updateGame', game_data, broadcast=True, room=room)

@socketio.on('getWikiPage')
def get_wikipage(data):
    page_name = data['wikiPage']

    page = Page(page_name).export()

    emit('wikiPage', page)


@socketio.on('message')
def message(message):
    user = db.user_list[request.sid]
    username = user.username
    room = user.room
    send(username+': '+message, broadcast=True, room=room) # send usernamd ane msg (emit?)


if __name__ == '__main__':
    socketio.run(app, debug=True)

