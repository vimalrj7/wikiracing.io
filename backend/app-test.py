from flask import Flask, render_template, request
from flask_socketio import SocketIO, send, join_room, leave_room, emit
from users import UserDB


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

users = {}

@socketio.on('connect')
def connect_msg():
    print('CONNECTION!')
    send('Someone connected.', broadcast=True)

@socketio.on('join')
def on_join(data):
    'Someone joined!'
    username = data['userName']
    room = data['roomCode']
    join_room(room)
    users[request.sid] = [username, room]

    emit('updateUsers', users, broadcast=True, room=room)


@socketio.on('disconnect')
def on_leave():
    print('DISCONNECTION!')
    user_left = users.pop(request.sid)
    emit('updateUsers', users, broadcast=True, room=user_left[1])

@socketio.on('mounted')
def on_leave():
    print('MOUNTED!')

 
@socketio.on('message')
def message(message):
    pass

if __name__ == '__main__':
    socketio.run(app, debug=True)