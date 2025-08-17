#!/bin/bash

# Se não estiver no diretório certo, muda para ele
if [[ $(pwd) != "/root/flask-project-hosting" ]]; then
    cd /root/flask-project-hosting
fi

# Iniciar o mariadb
sudo systemctl start mariadb

# Agora roda o túnel em background
cloudflared tunnel run nuvemhost &

# Ativa o ambiente virtual
source /root/diogo/venv/bin/activate

# Executa o Flask
python3 app.py
