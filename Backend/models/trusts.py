from sqlalchemy import Column, Integer, String, Boolean, Text
from database import Base


class Trust(Base):
    __tablename__ = "trusts"

    id = Column(Integer, primary_key=True, index=True)
    trust_name = Column(String)
    trust_address = Column(String)
    mobile_number = Column(String)
    email_id = Column(String, unique=True, index=True)
    password = Column(String)
    username = Column(String)
    city = Column(String)
    pincode = Column(String)
    is_verified = Column(Boolean, default=False)
    license_number = Column(String)
    trust_photo = Column(Text, nullable=True)
