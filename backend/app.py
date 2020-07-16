from flask import Flask, render_template, request
from flask_socketio import SocketIO, send, join_room, leave_room, emit
from users import UserDB
from flask_cors import CORS, cross_origin
import requests
import requests_cache



app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

db = UserDB()

requests_cache.install_cache()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/play', methods=['GET'])
def play():
    return render_template('play.html')

@app.route('/data')
def rooms():
    return db.get_rooms()

@app.route('/wiki/<wikipage>')
def wikiAPI(wikipage):
    #if start page: clicks = 0
    #if end page: redirect to game page
    url = 'https://en.wikipedia.org//w/api.php?action=parse&format=json&page='+wikipage+'&prop=text%7Cdisplaytitle&disablelimitreport=1&disableeditsection=1&formatversion=2'
    r = requests.get(url)
    print('From Cache: ', r.from_cache)
    json_data = r.json()
    p_html = json_data['parse']['text']
    title = json_data['parse']['title']

    return render_template('wikipage.html', title=title, p_html=p_html)


@socketio.on('join')
def on_join(data):
    print("Joining!")
    username = data['username']
    room = data['roomcode']
    join_room(room)

    db.add_user(request.sid, username, room)
    room_list = db.get_room_users(room)

    emit('updateUsers', room_list, broadcast=True, room=room)

    print(db)

@socketio.on('disconnect')
def on_leave():
    user = db.delete_user(request.sid)
    room = user['room']
    room_list = db.get_room_users(room)

    emit('updateUsers', room_list, broadcast = True, room = room)
    print('disconnection!')
    print(db)

 
@socketio.on('message')
def message(message):
    user = db.user_list[request.sid]
    username = user['username']
    room = user['room']
    send(username+': '+message, broadcast=True, room=room) # send usernamd ane msg (emit?)


if __name__ == '__main__':
    socketio.run(app, debug=True)

