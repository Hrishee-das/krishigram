# AgroAid AI Pro - Postman Testing Flow

To successfully test the `/api/analyze` endpoint in Postman and use the Web Dashboard (`http://localhost:8000`), you MUST first ensure the server is running on the newly created virtual environment containing all dependencies (OpenCV, SlowAPI, etc.).

## 🚀 Step 1: Restart your FastApi Server correctly
If your server has been running in the background for a long time, it is using the old Python environment.
1. Go to your terminal running `uvicorn`.
2. Press `CTRL + C` to stop the server.
3. Activate the new virtual environment:
   ```bash
   .\venv\Scripts\activate
   ```
4. Start the server again:
   ```bash
   uvicorn main:app --reload
   ```

## 🧪 Step 2: Postman Configuration

1. Open Postman.
2. Create a new request.
3. Change the HTTP method to **POST**.
4. Set the URL to: `http://localhost:8000/api/analyze`
5. Navigate to the **Body** tab below the URL.
6. Select the **`form-data`** radio button.

### Adding Variables

You must add key-value pairs here. **Important:** To upload files, hover your mouse over the "Key" input box. A small dropdown will appear saying "Text". Click it and change it to "File".

| Key Name | Type | Value (What to put inside) |
| :--- | :--- | :--- |
| `image` | **File** | Click "Select Files" and choose a leaf image (e.g. from PlantVillage). To test validation, try uploading a blurry photo! |
| `text` | **Text** | Type a question (e.g., "What is the treatment for this disease?") |
| `voice` | **File** | Click "Select Files" and upload a `.wav` or `.webm` audio recording of yourself speaking. |
| `language`| **Text** | Enter "English", "Hindi", "Marathi", or another supported language. |

## 🎯 Step 3: Run the Request
1. You do not need to fill out all fields! You can send just an `image` + `language`, or just `text` + `language`. The multimodal endpoint handles them all.
2. Click the blue **Send** button.
3. Scroll down to see the Unified JSON Response containing your translated disease analysis, RAG context, and AI confidence score!


## 🌐 Step 4: Testing the Web UI
The original interface at `http://localhost:8000/` will also work perfectly and instantly once you restart your server in Step 1. The latency has been heavily optimized!

---

## 🌤️ Step 5: Testing Phase 6 Advanced Features (Weather & Pinecone Logging)

In Phase 6, the API was upgraded to a Hybrid RAG architecture. Here is how to verify the new features in Postman:

### Test Scenario A: Live Weather Intelligence
1. Use the **`text`** key.
2. Type: `"I am in New Delhi. I want to spray Neem Oil today. Is it safe?"`
3. Click **Send**.
4. **Verification**: Read the JSON `"response"`. The AI will natively cite the *live* temperature, humidity, and weather conditions for New Delhi pulled dynamically from the Weather API, and advise you if the conditions are appropriate for spraying!

### Test Scenario B: Pinecone Self-Learning Logs
1. Ensure your `.env` contains the valid `PINECONE_API_KEY`.
2. Send *any* successful text or image query via Postman (e.g., `"What is Wheat Rust?"`).
3. **Verification**: 
   - Check your terminal console (where `uvicorn` is running). You will see a new print statement: `Self-Learning Sync: Successfully logged interaction vector to Pinecone.`
   - Go to your Pinecone Dashboard website. Look inside your `agroaid-db` index, and you will see a brand new vector has been *upserted*. The metadata will be marked as `"type": "historical_interaction"`. 
   - The AI will now "remember" this exact conversation the next time someone asks a similar question!
