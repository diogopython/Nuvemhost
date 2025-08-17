# README.md

# 🚀 Flask Hosting Project - Nuvemhost

Um sistema de hospedagem de projetos web usando **Flask + MySQL**.
Permite gerenciar uploads de projetos (ZIP), extrair arquivos e servir conteúdos de forma organizada.

---

## 📌 Tecnologias utilizadas

* Flask - Framework web em Python
* MySQL Connector - Conexão com banco de dados MySQL
* bcrypt - Criptografia de senhas
* python-dotenv - Carregar variáveis de ambiente
* Werkzeug - Utilitários para upload seguro
* Logging - Logs rotativos do servidor
* smtplib - Envio de e-mails via SMTP
* email.mime - Construção de e-mails multipart e texto

---

## ⚙️ Configuração do projeto

### 1️⃣ Clonar repositório

```
git clone https://github.com/diogopython/Nuvemhost.git
cd Nuvemhost
```

### 2️⃣ Criar ambiente virtual

```
python3 -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
```

### 3️⃣ Instalar dependências

```
pip install -r requirements.txt
```

### 4️⃣ Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```
DEBUG=True
SECRET_KEY=uma_chave_muito_secreta

# Banco de dados
DB_USER=*Coloque*
DB_PASS=*Coloque*
DB_HOST=localhost
DB_NAME=project_hosting

# Uploads e Logs
UPLOAD_FOLDER="/root/flaskhostingg/uploads"
ALLOWED_EXTENSIONS=["zip"]
ALLOWED_PROJECT_FILES=["html", "css", "js", "png", "jpg", "jpeg", "gif", "svg", "ico", "txt", "md", "json"]
LOG_FILE="flask.log"

# Email
SMTP_SERVER="*Coloque*"
SMTP_PORT=587
SMTP_USER="*Coloque*"
SMTP_PASS="*Coloque*"
```

---

## ▶️ Executar a aplicação

```
python app.py
```

Por padrão, a aplicação roda em:

```
http://127.0.0.1:5000
```

---

## 📂 Estrutura do projeto

```
flaskhostingg/
│── app.py              # Arquivo principal da aplicação Flask
│── config.py           # Configurações do projeto (opcional)
│── requirements.txt    # Dependências do Python
│── .env                # Variáveis de ambiente (não versionar)
│── .gitignore          # Arquivos ignorados pelo Git
│── uploads/            # Pasta de uploads (ignorada no Git)
│── templates/          # Templates HTML
│── static/             # Arquivos estáticos (CSS, JS, imagens)
```

---

## 🛡️ Segurança

* Nunca faça commit do arquivo `.env`
* Senhas são criptografadas com `bcrypt`
* Uploads permitidos são validados pela extensão

---

## 📜 Licença

Este projeto é open-source sob a licença **MIT**.