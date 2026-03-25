import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

# Cloudinary Configuration
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)


def upload_image(image_data: str):
    """
    Uploads a Base64 image string to Cloudinary and returns the URL.
    If image_data is not a Base64 string (i.e. already a URL), it returns it as is.
    """
    if not image_data or not isinstance(image_data, str):
        return image_data

    # Check if it's a Base64 string (starts with data:image)
    if image_data.startswith("data:image"):
        try:
            # Simple upload to Cloudinary
            upload_result = cloudinary.uploader.upload(image_data)
            # Return the secure URL
            return upload_result.get("secure_url")
        except Exception as e:
            print(f"Cloudinary Upload Error: {e}")
            # If upload fails, return the original string to avoid breaking everything
            return image_data

    # If it doesn't look like Base64, assume it's already a URL
    return image_data
