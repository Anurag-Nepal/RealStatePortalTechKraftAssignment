from django.core.management.base import BaseCommand
from accounts.models import CustomUser
from properties.models import Property
from django.db import transaction
import random
import uuid

CITIES_DATA = [
    {"name": "Kathmandu", "state": "Bagmati", "zip_start": 44600},
    {"name": "Lalitpur", "state": "Bagmati", "zip_start": 44700},
    {"name": "Bhaktapur", "state": "Bagmati", "zip_start": 44800},
    {"name": "Pokhara", "state": "Gandaki", "zip_start": 33700},
    {"name": "Biratnagar", "state": "Koshi", "zip_start": 56600},
    {"name": "Bharatpur", "state": "Bagmati", "zip_start": 44200},
    {"name": "Butwal", "state": "Lumbini", "zip_start": 32900},
    {"name": "Dharan", "state": "Koshi", "zip_start": 56700},
]

PROPERTY_TYPES_DISTRIBUTION = [
    ("house", 6),
    ("apartment", 4),
    ("condo", 3),
    ("townhouse", 2),
]

PROPERTY_TITLES = [
    "Modern Downtown Loft",
    "Charming Victorian Home",
    "Luxury Waterfront Condo", 
    "Spacious Family Townhouse",
    "Historic Brownstone Apartment",
    "Contemporary Glass House",
    "Cozy Garden Cottage",
    "Penthouse with City Views",
    "Elegant Colonial Estate",
    "Industrial Chic Loft",
    "Mediterranean Villa",
    "Craftsman Bungalow",
    "High-Rise Luxury Apartment",
    "Restored Warehouse Condo",
    "Suburban Dream Home"
]

PROPERTY_DESCRIPTIONS = [
    "A stunning property featuring modern amenities and exceptional design. Perfect for those seeking luxury and comfort in a prime location.",
    "This beautifully maintained home offers spacious living areas, updated kitchen, and a private backyard. Ideal for entertaining.",
    "Experience urban living at its finest in this sophisticated residence with premium finishes and breathtaking views.",
    "A rare find in today's market - this property combines historic charm with modern conveniences. Move-in ready!",
    "Enjoy peaceful living in this well-appointed home featuring an open floor plan, natural light, and high-end appliances.",
    "This exceptional property offers the perfect blend of style and functionality with premium upgrades throughout.",
    "Discover your new home in this immaculate residence featuring designer touches and a fantastic location.",
    "A truly remarkable property with attention to detail evident in every room. Schedule your private showing today!",
    "This gorgeous home features soaring ceilings, hardwood floors, and a gourmet kitchen perfect for culinary enthusiasts.",
    "Don't miss this incredible opportunity to own a piece of architectural beauty in one of the city's most desirable neighborhoods."
]

IMAGE_URLS = [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800", 
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800", 
    "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800", 
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800", 
    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800", 
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800", 
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", 
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", 
    "https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?w=800", 
    "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=800", 
    "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800", 
    "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800", 
    "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800", 
    "https://images.unsplash.com/photo-1591474200742-8e512e6f98f8?w=800", 
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", 
]

STREET_NAMES = [
    "Durbar Marg",
    "New Baneshwor Marg",
    "Kumaripati Road",
    "Jawalakhel Chowk",
    "Pulchowk Road",
    "Lakeside Road",
    "Boudha Marg",
    "Thamel Street",
    "Kupondole Height",
    "Sundhara Marg",
    "Kalanki Chowk",
    "Putalisadak",
    "Gongabu Bus Park",
    "Mahendra Highway",
    "Ring Road",
]

class Command(BaseCommand):
    help = "Creates enhanced seed data for properties and users. Use --skip-if-exists to skip if already seeded."

    def add_arguments(self, parser):
        parser.add_argument('--skip-if-exists', action='store_true', help='Skip if already seeded')
        parser.add_argument('--clear-first', action='store_true', help='Clear existing data first')

    @transaction.atomic
    def handle(self, *args, **options):
        if options['skip_if_exists'] and Property.objects.exists():
            self.stdout.write(self.style.SUCCESS('Seed data exists, skipping.'))
            return
            
        if options['clear_first']:
            Property.objects.all().delete()
            self.stdout.write(self.style.WARNING('Cleared existing property data.'))

        admin_user, _ = CustomUser.objects.get_or_create(
            email="admin@portal.com",
            defaults={
                "name": "Admin User",
                "role": "admin",
            },
        )
        admin_user.name = "Admin User"
        admin_user.role = "admin"
        admin_user.is_active = True
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.set_password("Admin1234!")
        admin_user.save()

        buyer_user, _ = CustomUser.objects.get_or_create(
            email="buyer@portal.com",
            defaults={
                "name": "Buyer User",
                "role": "buyer",
            },
        )
        buyer_user.name = "Buyer User"
        buyer_user.role = "buyer"
        buyer_user.is_active = True
        buyer_user.set_password("Buyer1234!")
        buyer_user.save()

        property_index = 0
        created_properties = []
        
        for property_type, count in PROPERTY_TYPES_DISTRIBUTION:
            for i in range(count):
                city_data = random.choice(CITIES_DATA)
                
                base_price = self.get_base_price(city_data["name"], property_type)
                price = base_price + random.randint(-50000, 200000)
                price = max(185000, price)
                
                sqft = self.get_sqft_for_type(property_type)
                
                bedrooms, bathrooms = self.get_rooms_for_sqft(sqft, property_type)
                
                property_data = {
                    'id': uuid.uuid4(),
                    'title': random.choice(PROPERTY_TITLES),
                    'address': f"{random.randint(100, 9999)} {random.choice(STREET_NAMES)}",
                    'city': city_data["name"],
                    'state': city_data["state"],
                    'zip_code': str(city_data["zip_start"] + random.randint(0, 999)),
                    'price': price,
                    'bedrooms': bedrooms,
                    'bathrooms': bathrooms,
                    'sqft': sqft,
                    'property_type': property_type,
                    'description': random.choice(PROPERTY_DESCRIPTIONS),
                    'image_url': random.choice(IMAGE_URLS),
                    'is_available': random.choice([True, True, True, False]),
                }
                
                property_obj = Property.objects.create(**property_data)
                created_properties.append(property_obj)
                property_index += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(created_properties)} properties:\n'
                f'  - {sum(1 for p in created_properties if p.property_type == "house")} houses\n'
                f'  - {sum(1 for p in created_properties if p.property_type == "apartment")} apartments\n'
                f'  - {sum(1 for p in created_properties if p.property_type == "condo")} condos\n'
                f'  - {sum(1 for p in created_properties if p.property_type == "townhouse")} townhouses\n'
                f'Price range: ${min(p.price for p in created_properties):,} - ${max(p.price for p in created_properties):,}'
            )
        )

    def get_base_price(self, city, property_type):
        city_multipliers = {
            "Kathmandu": 1.6,
            "Lalitpur": 1.5,
            "Bhaktapur": 1.4,
            "Pokhara": 1.4,
            "Biratnagar": 1.1,
            "Bharatpur": 1.2,
            "Butwal": 1.0,
            "Dharan": 1.0,
        }
        
        type_base_prices = {
            "house": 450000,
            "apartment": 350000,
            "condo": 400000,
            "townhouse": 380000,
        }
        
        base = type_base_prices.get(property_type, 400000)
        multiplier = city_multipliers.get(city, 1.0)
        
        return int(base * multiplier)

    def get_sqft_for_type(self, property_type):
        ranges = {
            "apartment": (800, 1800),
            "condo": (900, 2200),
            "townhouse": (1200, 2800),
            "house": (1400, 4500),
        }
        
        min_sqft, max_sqft = ranges.get(property_type, (1000, 2500))
        return random.randint(min_sqft, max_sqft)

    def get_rooms_for_sqft(self, sqft, property_type):
        if sqft < 1000:
            bedrooms = random.choices([1, 2], weights=[70, 30])[0]
        elif sqft < 1500:
            bedrooms = random.choices([2, 3], weights=[60, 40])[0]
        elif sqft < 2500:
            bedrooms = random.choices([2, 3, 4], weights=[20, 50, 30])[0]
        else:
            bedrooms = random.choices([3, 4, 5], weights=[30, 50, 20])[0]
            
        
        if bedrooms <= 2:
            bathrooms = random.choices([1.0, 1.5, 2.0], weights=[30, 40, 30])[0]
        elif bedrooms == 3:
            bathrooms = random.choices([2.0, 2.5, 3.0], weights=[40, 40, 20])[0]
        else:
            bathrooms = random.choices([2.5, 3.0, 3.5], weights=[30, 50, 20])[0]
            
        return bedrooms, bathrooms
