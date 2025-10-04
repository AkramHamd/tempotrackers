from enum import Enum
from typing import List, Dict, Optional
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class AlertType(Enum):
    WARNING = "warning"
    INFO = "info"
    DANGER = "danger"
    CRITICAL = "critical"

class StakeholderType(Enum):
    HEALTH_SENSITIVE = "health_sensitive"
    SCHOOL_ADMIN = "school_admin"
    GOVERNMENT = "government"
    EMERGENCY_RESPONSE = "emergency_response"
    GENERAL_PUBLIC = "general_public"

class AlertRule:
    def __init__(self, aqi_threshold: int, stakeholder_type: StakeholderType, alert_type: AlertType):
        self.aqi_threshold = aqi_threshold
        self.stakeholder_type = stakeholder_type
        self.alert_type = alert_type

class NotificationService:
    def __init__(self):
        self.alert_rules = self._initialize_alert_rules()
        self.notification_history = []
    
    def _initialize_alert_rules(self) -> List[AlertRule]:
        """Initialize alert rules for different stakeholders"""
        return [
            AlertRule(50, StakeholderType.HEALTH_SENSITIVE, AlertType.WARNING),
            AlertRule(100, StakeholderType.SCHOOL_ADMIN, AlertType.WARNING),
            AlertRule(150, StakeholderType.GENERAL_PUBLIC, AlertType.DANGER),
            AlertRule(200, StakeholderType.EMERGENCY_RESPONSE, AlertType.CRITICAL),
        ]
    
    def evaluate_alerts(self, air_quality_data: Dict, location: Dict) -> List[Dict]:
        """Evaluate if alerts should be triggered based on air quality data"""
        alerts = []
        aqi = air_quality_data.get('aqi', 0)
        
        for rule in self.alert_rules:
            if aqi >= rule.aqi_threshold:
                alert = {
                    "id": f"alert_{datetime.now().timestamp()}",
                    "type": rule.alert_type.value,
                    "stakeholder": rule.stakeholder_type.value,
                    "message": self._generate_alert_message(rule, aqi),
                    "timestamp": datetime.now().isoformat(),
                    "location": location,
                    "aqi": aqi
                }
                alerts.append(alert)
        
        return alerts
    
    def _generate_alert_message(self, rule: AlertRule, aqi: int) -> str:
        """Generate appropriate alert message based on rule and AQI"""
        messages = {
            StakeholderType.HEALTH_SENSITIVE: f"Air quality alert: AQI {aqi}. Sensitive groups should limit outdoor activities.",
            StakeholderType.SCHOOL_ADMIN: f"Air quality warning: AQI {aqi}. Consider limiting outdoor activities for students.",
            StakeholderType.GENERAL_PUBLIC: f"Unhealthy air quality: AQI {aqi}. Everyone should avoid prolonged outdoor activities.",
            StakeholderType.EMERGENCY_RESPONSE: f"Critical air quality: AQI {aqi}. Emergency response protocols may be needed.",
        }
        return messages.get(rule.stakeholder_type, f"Air quality alert: AQI {aqi}")
    
    def send_notification(self, alert: Dict, recipient: str, method: str = "email"):
        """Send notification to recipient"""
        # TODO: Implement actual notification sending
        notification = {
            "alert_id": alert["id"],
            "recipient": recipient,
            "method": method,
            "sent_at": datetime.now().isoformat(),
            "status": "sent"
        }
        self.notification_history.append(notification)
        return notification

if __name__ == "__main__":
    service = NotificationService()
    print("Notification Service initialized")
