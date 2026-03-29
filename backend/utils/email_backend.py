from django.core.mail.backends.smtp import EmailBackend
import ssl


class InsecureSMTPEmailBackend(EmailBackend):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ssl_context = ssl._create_unverified_context()
