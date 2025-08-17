import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from os import getenv

load_dotenv()

# Configurações do servidor de e-mail (pode ser Gmail, Zoho, etc.)
SMTP_SERVER = getenv("SMTP_SERVER")
SMTP_PORT = getenv("SMTP_PORT")
SMTP_USER = getenv("SMTP_USER")
SMTP_PASS = getenv("SMTP_PASS")

class EmailService:
    def __init__(self, remetente, nome_remetente):
        self.remetente = remetente
        self.nome_remetente = nome_remetente

    def enviar_boas_vindas(self, destinatario, nome_usuario):
        assunto = "Bem-vindo ao NuvemHost 🚀"
        corpo = f"""
        <html>
        <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
          <table align="center" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; padding:20px; margin-top:30px;">
            <tr>
              <td align="center">
                <h1 style="color:#7c3aed; margin-bottom:10px;">Olá, {nome_usuario}!</h1>
                <p style="color:#444444; font-size:16px; margin-bottom:20px;">
                  Seja muito bem-vindo ao <strong>NuvemHost</strong>! 🎉
                </p>
                <p style="color:#444444; font-size:14px; margin-bottom:30px;">
                  Estamos felizes em ter você conosco. Explore nossos serviços e aproveite ao máximo!
                </p>
                <a href="https://nuvemhost.xyz" 
                   style="display:inline-block; background:linear-gradient(90deg,#7c3aed,#06b6d4); 
                          color:#ffffff; padding:14px 22px; border-radius:6px; text-decoration:none; font-weight:bold;">
                  Acessar NuvemHost
                </a>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top:30px; color:#888888; font-size:12px;">
                Atenciosamente,<br>{self.nome_remetente} - NuvemHost
              </td>
            </tr>
          </table>
        </body>
        </html>
        """

        msg = MIMEMultipart()
        msg["From"] = f"{self.nome_remetente} <{self.remetente}>"
        msg["To"] = destinatario
        msg["Subject"] = assunto
        msg.attach(MIMEText(corpo, "html"))

        try:
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASS)
                server.sendmail(self.remetente, destinatario, msg.as_string())
            return True
        except Exception as e:
            print("Erro ao enviar e-mail:", e)
            return False

def BoasVindas(nome, email):
    service = EmailService(SMTP_USER, "Equipe NuvemHost")
    enviado = service.enviar_boas_vindas(email, nome)