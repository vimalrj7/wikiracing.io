from flask import Flask, render_template, request
from flask_socketio import SocketIO, send, join_room, leave_room, emit
from User import User
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

""" 
@app.route('/')
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

        if room_code not in rooms:
            rooms[room_code] = Room(room_code)
        
        rooms[room_code].add_user(username, request.sid)
        join_room(room_code)

        room_data = rooms[room_code].export()
        print(room_data)

        emit('updateRoom', room_data, broadcast=True, room=room_code)


@socketio.on('disconnect')
def on_leave():
    print('Disconnect!')

    for code, room in rooms.items():
        if removed := room.delete_user(request.sid):
            room_code = code
            leave_room(room_code)
            if room.users == {}:
                del rooms[code]
            break
    
    if room_code in rooms:
        room_data = rooms[room_code].export()
        emit('updateRoom', room_data, broadcast = True, room = room_code)



@socketio.on('startRound')
def start_game(data):
    print("Starting Game!")
    room_code = data['roomCode']

    room = rooms[room_code]

    room.start_game()

    room_data = room.export()
    emit('startRound', {'startPage': room.start_page}, broadcast=True, room=room_code)

@socketio.on('updateRoom')
def update_room(data):
    print('Updating!')
    room_code = data['roomCode']
    room = rooms[room_code]

    room_data = room.export()
    print(room_data)

    emit('updateRoom', room_data, broadcast=True, room=room_code)


@socketio.on('randomizePages')
def randomize(data):
    'Recived Randomize emit'
    room_code = data['roomCode']
    room = rooms[room_code]

    room.randomize_pages()

    room_data = room.export()

    emit('updateRoom', room_data, broadcast=True, room=room_code)

@socketio.on('updatePage')
def get_wikipage(data):
    print('UPDATING PAGE')
    room_code = data['roomCode']
    page_name = data['wikiPage']
    room = rooms[room_code]

    page = Page(page_name).export()

    emit('updatePage', page)

    room.update_game(request.sid, page_name)

    if room.round_end:
        print('ENDING GAME') 
        emit('endRound', broadcast=True, room=room_code)



@socketio.on('chatMSG')
def message(data):
    print('SENDING MESG')
    message = data['message']
    user_name = data['userName']
    room_code = data['roomCode']

    msg_item = {'username': user_name, 'message': message}

    emit('chatMSG', msg_item, broadcast=True, room=room_code)

@socketio.on('validateData')
def validate_data():
    print('Sending data for validation!')

    json_data = {}

    for code, room in rooms.items():
        json_data[code] = room.export()

    emit('validateData', json_data)

if __name__ == '__main__':
    socketio.run(app, debug=True)

