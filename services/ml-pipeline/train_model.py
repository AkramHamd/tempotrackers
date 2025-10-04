import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os

class AirQualityPredictor:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.is_trained = False
        
    def prepare_features(self, data):
        """Prepare features for model training/inference"""
        # TODO: Implement feature engineering
        features = ['lat', 'lon', 'temperature', 'humidity', 'wind_speed', 'pressure']
        return data[features]
    
    def train(self, X, y):
        """Train the air quality prediction model"""
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        self.model.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        print(f"Model trained successfully!")
        print(f"MSE: {mse:.4f}")
        print(f"R²: {r2:.4f}")
        
        self.is_trained = True
        return self.model
    
    def predict(self, features):
        """Make air quality predictions"""
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        return self.model.predict(features)
    
    def save_model(self, path):
        """Save trained model"""
        joblib.dump(self.model, path)
    
    def load_model(self, path):
        """Load pre-trained model"""
        self.model = joblib.load(path)
        self.is_trained = True

if __name__ == "__main__":
    # TODO: Load training data and train model
    predictor = AirQualityPredictor()
    print("ML Pipeline initialized")
