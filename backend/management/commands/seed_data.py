from django.core.management.base import BaseCommand
from properties.management.commands.seed_data import Command as PropertiesSeedCommand


class Command(BaseCommand):
    help = "Seed admin user and sample properties. Proxies to properties.seed_data."

    def add_arguments(self, parser):
        PropertiesSeedCommand().add_arguments(parser)

    def handle(self, *args, **options):
        PropertiesSeedCommand().handle(*args, **options)
