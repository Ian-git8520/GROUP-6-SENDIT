import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from datetime import datetime

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
    msg.attach(MIMEText(message, "html"))

    try:
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        print(f"[EMAIL] Successfully sent email to {to_email}: {subject}")
        return True

    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email to {to_email}: {str(e)}")
        return False

def send_delivery_status_email(to_email: str, delivery_id: int, old_status: str, new_status: str, customer_name: str = "Customer") -> bool:
    """
    Send real-time email notification when delivery status changes
    """
    status_colors = {
        "pending": "#FFA500",
        "accepted": "#4169E1",
        "in_transit": "#32CD32",
        "delivered": "#228B22",
        "cancelled": "#DC143C"
    }

    status_messages = {
        "pending": "Your order is pending confirmation",
        "accepted": "Your order has been accepted and assigned to a driver",
        "in_transit": "Your order is on the way to you",
        "delivered": "Your order has been successfully delivered",
        "cancelled": "Your order has been cancelled"
    }

    color = status_colors.get(new_status, "#4169E1")
    message = status_messages.get(new_status, "Your order status has been updated")

    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #2c3e50;">SendIT - Delivery Status Update</h2>
            
            <p>Dear {customer_name},</p>
            
            <p>Your delivery order status has been updated:</p>
            
            <div style="background-color: {color}; color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin: 0;">Delivery #{delivery_id}</h3>
                <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold;">{new_status.upper()}</p>
            </div>
            
            <p>{message}</p>

            <p><strong>Updated At:</strong> {timestamp}</p>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p>Thank you for using SendIT!</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">© 2024 SendIT. All rights reserved.</p>
        </div>
    </body>
    </html>
    """

    return send_email(to_email, f"SendIT - Delivery #{delivery_id} Status: {new_status.upper()}", html_content)

if __name__ == "__main__":
    send_email(
        to_email="your_email@gmail.com",
        subject="Test Email",
        message="Email service works!"
    )
