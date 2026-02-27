import cv2
import numpy as np

def validate_image_quality(image_bytes: bytes) -> dict:
    """
    Validates uploaded image quality (blurriness, lighting) using OpenCV.
    Gemini Semantic verification is disabled to prevent 429 Error Free-Tier Quota limits.
    """
    try:
        # Convert bytes to numpy array for OpenCV
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if img is None:
             return {"valid": False, "error": "Invalid image format. Could not decode."}
             
        # 1. Lighting Detection (Mean Intensity) - Check first
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        mean_intensity = np.mean(gray)
        if mean_intensity < 10 or mean_intensity > 245:
            return {"valid": False, "error": "Image quality is not proper (lighting issue). Please upload a clear image."}

        # 2. Blur Detection (Variance of Laplacian)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var < 15:
            return {"valid": False, "error": "Image is blurry. Please re-upload a clear image."}
            
        return {"valid": True}
        
    except Exception as e:
        print(f"Validation Error: {e}")
        return {"valid": True}
