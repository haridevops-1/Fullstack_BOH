from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
import datetime
from database import Base


class Donation(Base):
    __tablename__ = "food_form"

    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("users.id"))
    trust_id = Column(Integer, ForeignKey("trusts.id"))
    name = Column(String)
    mobile_number = Column(String)
    food_name = Column(String)
    category = Column(String)
    approx_quantity = Column(String)
    address = Column(String)
    area_landmark = Column(String)
    city = Column(String)
    pincode = Column(String)
    notes = Column(Text, nullable=True)
    status = Column(String, default="pending")
    created_at = Column(
        DateTime(timezone=True), default=func.now(), server_default=func.now()
    )

    # Extra fields for trust updates
    scheduled_time = Column(String, nullable=True)
    reject_reason = Column(String, nullable=True)
    completion_image = Column(Text, nullable=True)
