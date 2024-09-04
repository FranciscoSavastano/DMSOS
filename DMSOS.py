from flask import Flask, request, jsonify
import jwt
from jwt import encode

app = Flask(__name__)

# Substitua com suas informações de segredo
SECRET_KEY = 'your_secret_key'

# Simulando um banco de dados de usuários
users = {
    'anne': 'merenda',
    'michael': 'leadamericas'
}

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if username in users and users[username] == password:
        message = "sucesso"
        token = jwt.encode({'username': username}, SECRET_KEY, algorithm='HS256')
        return jsonify({'token': token, 'sucesso': message})
    else:
        return jsonify({'message': 'Credenciais inválidas'}), 401

if __name__ == '__main__':
    app.run(debug=True)
    print("oi")
