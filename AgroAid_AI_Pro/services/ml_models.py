import os
from dotenv import load_dotenv
import tensorflow as tf
import keras
import numpy as np
import io
import json
from PIL import Image
import random

load_dotenv(override=True)

class PlantDiseaseModel:
    def __init__(self, model_path: str = "best_agroaid_model_phase1.h5", class_indices_path: str = "class_indices.json"):
        # Look for files in the same directory as this script's project root
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.model_path = os.path.join(base_dir, model_path)
        self.class_indices_path = os.path.join(base_dir, class_indices_path)
        self.model = None
        self.class_indices = {}
        
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.class_indices_path):
                print(f"DEBUG: Both files exist. Loading model...")
                # Robust loading for potential Keras 2/3 mismatches
                try:
                    # Try standard load first
                    self.model = tf.keras.models.load_model(self.model_path, compile=False)
                except Exception as e:
                    print(f"Standard TF load failed: {e}. Trying custom fallback...")
                    
                    # Define dummy objects to ignore Keras 2/3 serialization differences
                    from tensorflow.keras.layers import InputLayer
                    class PatchedInputLayer(InputLayer):
                        def __init__(self, *args, **kwargs):
                            for k in ['batch_shape', 'optional', 'quantization_config']:
                                kwargs.pop(k, None)
                            super().__init__(*args, **kwargs)

                    class PatchedDTypePolicy:
                        def __init__(self, name="float32", *args, **kwargs):
                            self.name = name
                            self.compute_dtype = "float32"
                            self.variable_dtype = "float32"
                            self._name = name
                            kwargs.pop('quantization_config', None)
                        @property
                        def name(self): return self._name
                        @name.setter
                        def name(self, value): self._name = value
                        @classmethod
                        def from_config(cls, config):
                            return cls(name=config.get("name", "float32"))
                        def get_config(self):
                            return {"name": self.name}

                    try:
                        custom_objects = {
                            "InputLayer": PatchedInputLayer,
                            "DTypePolicy": PatchedDTypePolicy,
                            "DTypePolicyV2": PatchedDTypePolicy # Sometimes referenced as V2
                        }
                        self.model = tf.keras.models.load_model(
                            self.model_path, 
                            compile=False, 
                            custom_objects=custom_objects
                        )
                    except Exception as e2:
                        print(f"CRITICAL: Failed to load model even with Patched objects: {e2}")
                        self.model = None
                
                with open(self.class_indices_path, "r") as f:
                    self.class_indices = json.load(f)
                print(f"Loaded TensorFlow model successfully with {len(self.class_indices)} classes.")
            else:
                if not os.path.exists(self.model_path): print(f"DEBUG: Model file MISSING")
                if not os.path.exists(self.class_indices_path): print(f"DEBUG: Indices file MISSING")
                print("Model or Indices not found. Run training script first. Using mock for now.")
        except Exception as e:
            print(f"Error loading model: {e}")

    def predict(self, image_bytes: bytes) -> tuple[str, float]:
        """
        Primary Engine: Uses local MobileNetV2 if available.
        Triggers vision fallback if confidence is low (<0.70) or model is missing.
        """
        try:
            # If TF model is missing, go straight to vision fallback
            if self.model is None:
                print("TF Model missing/failed. Calling OpenRouter Vision Fallback...")
                result = self.fallback_predict(image_bytes)
                return result, 1.0  # Semantic confidence
            
            # 1. Local TF Prediction
            img = Image.open(io.BytesIO(image_bytes))
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img = img.resize((224, 224))
            
            img_array = np.array(img, dtype=np.float32)
            img_array = np.expand_dims(img_array, axis=0)
            img_array /= 255.0
            
            predictions = self.model.predict(img_array)
            predicted_class_idx = np.argmax(predictions, axis=1)[0]
            tf_confidence = float(np.max(predictions))
            tf_disease = self.class_indices.get(str(predicted_class_idx), "Unknown")
            
            # 2. Check for Low Confidence -> Multimodal Fallback
            if tf_confidence < 0.70:
                print(f"Low TF Confidence ({tf_confidence:.2f}). Verifying with OpenRouter Vision Fallback...")
                result = self.fallback_predict(image_bytes)
                return result, 1.0
                
            return tf_disease, tf_confidence

        except Exception as e:
            print(f"Prediction Pipeline Error: {e}. Attempting emergency fallback...")
            try:
                result = self.fallback_predict(image_bytes)
                return result, 1.0
            except:
                return "Error Processing Image", 0.0
        
    def fallback_predict(self, image_bytes: bytes) -> str:
        """
        Multimodal Fallback Chain using OpenRouter Free Vision models.
        """
        prompt = "Identify the plant disease in this image. \n1. If it is NOT a plant leaf or crop, output: 'Not a Plant'.\n2. If it is a healthy plant, output: 'Healthy'.\n3. If it is a diseased plant, output ONLY the name of the disease (e.g. 'Tomato Early Blight').\n\nOutput only the final name or status. No explanation."
        
        try:
            import base64
            from openai import OpenAI
            api_key = os.getenv("OPENROUTER_API_KEY")
            model = os.getenv("OPENROUTER_VISION_MODEL", "nvidia/nemotron-nano-12b-v2-vl:free")
            if api_key:
                client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=api_key)
                base64_image = base64.b64encode(image_bytes).decode('utf-8')
                
                print(f"DEBUG: Calling OpenRouter Vision with model: {model}")
                response = client.chat.completions.create(
                    model=model,
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image_url",
                                    "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                                }
                            ]
                        }
                    ]
                )
                if response.choices and len(response.choices) > 0:
                    disease_name = response.choices[0].message.content
                    if disease_name:
                        disease_name = disease_name.strip().replace(".", "")
                        print(f"DEBUG: OpenRouter Vision ({model}) check: {disease_name}")
                        return disease_name
                
                print(f"OpenRouter Vision returned empty or malformed response: {response}")
                return "Unable to determine (Empty response)"
            else:
                return "Unable to determine (API Key Missing)"
        except Exception as e:
            print(f"OpenRouter Vision Error: {e}")
            return f"Unable to determine (API Error: {str(e)[:50]})"

ml_model = PlantDiseaseModel()
