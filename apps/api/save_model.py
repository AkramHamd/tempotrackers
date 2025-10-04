import joblib
import os

def save_model():
    """Save the model in the correct format for the current XGBoost version."""
    MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "SO2_model.pkl")
    MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), "models", "SO2_model.json")
    
    try:
        # Load the pickled model
        model = joblib.load(MODEL_PATH)
        
        # Save in XGBoost's native format
        model.save_model(MODEL_SAVE_PATH)
        print(f"Model saved successfully to {MODEL_SAVE_PATH}")
        
    except Exception as e:
        print(f"Error saving model: {e}")

if __name__ == "__main__":
    save_model()
