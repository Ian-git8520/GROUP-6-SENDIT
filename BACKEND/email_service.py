import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def send_email(to_email: str, subject: str, message: str) -> bool:
    sender_email = os.getenv("EMAIL_USER")
    sender_password = os.getenv("EMAIL_PASSWORD")
    smtp_host = os.getenv("EMAIL_HOST")
    smtp_port = int(os.getenv("EMAIL_PORT", 587))

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(message, "plain"))

    try:
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        return True

    except Exception as e:
        print("Email error:", e)
        return False

def send_delivery_status_email(to_email, delivery_id, status):
    print(f"[EMAIL] Sending email to {to_email} | Delivery {delivery_id} → {status}")

if __name__ == "__main__":
    send_email(
        to_email="your_email@gmail.com",
        subject="Test Email",
        message="Email service works!"
    )
