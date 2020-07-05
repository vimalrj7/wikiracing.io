from flask import Flask, render_template, request
from flask_socketio import SocketIO, send, join_room, leave_room, emit
from users import UserDB


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

db = UserDB()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/play', methods=['GET'])
def play():
    return render_template('play.html')

@socketio.on('join')
def on_join(data):
    print("Joining!")
    username = data['username']
    room = data['roomcode']
    join_room(room)

    db.add_user(request.sid, username, room)
    room_list = db.get_room_users(room)

    emit('userlist', room_list, broadcast=True, room=room)

    print(db)

@socketio.on('disconnect')
def on_leave():
    user = db.delete_user(request.sid)
    room = user['room']
    room_list = db.get_room_users(room)

    emit('userlist', room_list, broadcast = True, room = room)

    print(db)

 
@socketio.on('message')
def message(message):
    user = db.user_list[request.sid]
    username = user['username']
    room = user['room']
    send(username+': '+message, broadcast=True, room=room)


@socketio.on('starttimer')
def start_timer():
    user = db.user_list[request.sid]
    room = user['room']
    emit('starttimer', broadcast=True, room=room)

@socketio.on('stoptimer')
def start_timer():
    user = db.user_list[request.sid]
    room = user['room']
    emit('stoptimer', user, broadcast=True, room=room)

if __name__ == '__main__':
    socketio.run(app, debug=True)