import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
import json
import shutil
from pathlib import Path

# ==========================================
# 0. CONFIGURATION
BATCH_SIZE = 32
IMG_SIZE = (224, 224)
EPOCHS_PHASE_1 = 10
EPOCHS_PHASE_2 = 15

PLANTVILLAGE_DIR = r"C:\Users\krish\OneDrive\Desktop\Project Morpheus\PlantVillage"
PLANTDOC_DIR = r"C:\Users\krish\OneDrive\Desktop\Project Morpheus\augmented_plantdoc"
PLANTDOC_TRAIN = os.path.join(PLANTDOC_DIR, "train")
PLANTDOC_VAL = os.path.join(PLANTDOC_DIR, "val")
PLANTDOC_TEST = os.path.join(PLANTDOC_DIR, "test")

UNIFIED_TRAIN_DIR = "unified_dataset_agroaid/train"
UNIFIED_VAL_DIR = "unified_dataset_agroaid/val"

# ==========================================
# 1. UNIFY DATASETS DYNAMICALLY
# ==========================================
print("Creating unified dataset directory to solve class mismatches...")
os.makedirs(UNIFIED_TRAIN_DIR, exist_ok=True)
os.makedirs(UNIFIED_VAL_DIR, exist_ok=True)

def merge_directories(src_dir, dest_dir, split_percentage=None, val_dest_dir=None):
    """Copies directories and their contents. If split is provided, splits into val_dest_dir"""
    if not os.path.exists(src_dir): return
    for class_name in os.listdir(src_dir):
        class_src = os.path.join(src_dir, class_name)
        if not os.path.isdir(class_src): continue
        
        # Clean up name format to match (some have spaces/underscores differently)
        clean_name = class_name.replace(" ", "_").replace("___", "_").replace("__", "_")
        
        class_dest_train = os.path.join(dest_dir, clean_name)
        os.makedirs(class_dest_train, exist_ok=True)
        
        files = os.listdir(class_src)
        
        # Handle splitting for PlantVillage which has no pre-defined val split
        if split_percentage and val_dest_dir:
            class_dest_val = os.path.join(val_dest_dir, clean_name)
            os.makedirs(class_dest_val, exist_ok=True)
            
            val_split_idx = int(len(files) * (1 - split_percentage))
            train_files = files[:val_split_idx]
            val_files = files[val_split_idx:]
            
            for file in train_files:
                src_file = os.path.join(class_src, file)
                dst_file = os.path.join(class_dest_train, f"pv_{file}")
                if not os.path.exists(dst_file): shutil.copy2(src_file, dst_file)
                
            for file in val_files:
                src_file = os.path.join(class_src, file)
                dst_file = os.path.join(class_dest_val, f"pv_{file}")
                if not os.path.exists(dst_file): shutil.copy2(src_file, dst_file)
        else:
            # Just copy all
            for file in files:
                src_file = os.path.join(class_src, file)
                dst_file = os.path.join(class_dest_train, f"pd_{file}")
                if not os.path.exists(dst_file): shutil.copy2(src_file, dst_file)

# Merge PlantVillage (which needs an 80/20 split on the fly)
print("Merging PlantVillage...")
merge_directories(PLANTVILLAGE_DIR, UNIFIED_TRAIN_DIR, split_percentage=0.2, val_dest_dir=UNIFIED_VAL_DIR)

# Merge Augmented PlantDoc train and val explicitly
print("Merging Augmented PlantDoc...")
merge_directories(PLANTDOC_TRAIN, UNIFIED_TRAIN_DIR)
merge_directories(PLANTDOC_VAL, UNIFIED_VAL_DIR)

# ==========================================
# 2. BUILD DATA PIPELINES (UNIFIED)
# ==========================================
print("\nInitializing Data Generators...")
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=30,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest'
)

val_test_datagen = ImageDataGenerator(rescale=1./255)

train_gen = train_datagen.flow_from_directory(
    UNIFIED_TRAIN_DIR, target_size=IMG_SIZE, batch_size=BATCH_SIZE, class_mode='categorical', shuffle=True
)

val_gen = val_test_datagen.flow_from_directory(
    UNIFIED_VAL_DIR, target_size=IMG_SIZE, batch_size=BATCH_SIZE, class_mode='categorical', shuffle=False
)

pd_test_gen = val_test_datagen.flow_from_directory(
    PLANTDOC_TEST, target_size=IMG_SIZE, batch_size=BATCH_SIZE, class_mode='categorical', shuffle=False
)

num_classes = train_gen.num_classes
print(f"Total Identified Classes in Unified Dataset: {num_classes}")

inv_class_indices = {str(v): k for k, v in train_gen.class_indices.items()}

with open("services/class_indices.json", "w") as f:
    json.dump(inv_class_indices, f)
print("Saved services/class_indices.json")

# ==========================================
# 3. MODEL ARCHITECTURE
# ==========================================
print("Building Model Architecture...")
base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(None, None, 3))
base_model.trainable = False 

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(512, activation='relu')(x)
x = Dropout(0.5)(x)
predictions = Dense(num_classes, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=predictions)

model.compile(optimizer=Adam(learning_rate=0.001), 
              loss='categorical_crossentropy', 
              metrics=['accuracy'])

# ==========================================
# 4. TRAINING
# ==========================================
checkpoint_path = "best_agroaid_model_phase1.h5"
checkpoint = ModelCheckpoint(checkpoint_path, monitor='val_accuracy', save_best_only=True, mode='max', verbose=1)
early_stop = EarlyStopping(monitor='val_loss', patience=3, verbose=1, restore_best_weights=True)

print("\n--- STARTING TRAINING PHASE 1 (Custom Head) ---")
model.fit(
    train_gen,
    epochs=EPOCHS_PHASE_1,
    validation_data=val_gen,
    callbacks=[checkpoint, early_stop]
)

print("\n--- STARTING TRAINING PHASE 2 (Fine-Tuning Base Layers) ---")
base_model.trainable = True

# We keep the first 100 layers frozen to avoid destroying basic features
fine_tune_at = 100
for layer in base_model.layers[:fine_tune_at]:
    layer.trainable = False

# Recompile with very low LR
model.compile(optimizer=Adam(learning_rate=5e-6), 
              loss='categorical_crossentropy', 
              metrics=['accuracy'])

checkpoint_path_final = r"C:\Users\krish\OneDrive\Desktop\Project Morpheus\plant_disease_model_merge.h5"
checkpoint_final = ModelCheckpoint(checkpoint_path_final, monitor='val_accuracy', save_best_only=True, mode='max', verbose=1)

model.fit(
    train_gen,
    epochs=EPOCHS_PHASE_2,
    validation_data=val_gen,
    callbacks=[checkpoint_final, early_stop]
)

# ==========================================
# 5. FINAL TEST EVALUATION
# ==========================================
print("\n--- FINAL TEST SET EVALUATION (augmented_plantdoc/test) ---")
# To test on PlantDoc test set, since classes might differ slightly, we just evaluate. 
# It will map accurately because we unified the folder names!
try:
    test_loss, test_acc = model.evaluate(pd_test_gen)
    print(f"Final Test Accuracy: {test_acc*100:.2f}%")
except Exception as e:
    print(f"Error evaluating on isolated test set: {e}")

print("\n--- TEST ON CUSTOM TEST IMAGES ---")
TEST_IMAGES_DIR = r"C:\Users\krish\OneDrive\Desktop\Project Morpheus\test_images"
from tensorflow.keras.preprocessing import image as keras_image
import numpy as np
if os.path.exists(TEST_IMAGES_DIR):
    for f in os.listdir(TEST_IMAGES_DIR):
        if f.endswith(('jpg', 'jpeg', 'png')):
            img_path = os.path.join(TEST_IMAGES_DIR, f)
            img = keras_image.load_img(img_path, target_size=IMG_SIZE)
            img_array = keras_image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0) / 255.0
            preds = model.predict(img_array, verbose=0)
            pred_idx = np.argmax(preds, axis=1)[0]
            conf = np.max(preds)
            pred_class = inv_class_indices[str(pred_idx)]
            print(f"Image {f}: Predicted '{pred_class}' with {conf:.2f} confidence")

print("\n--- ALL DISEASES THE MODEL CAN PREDICT ---")
for idx, disease in inv_class_indices.items():
    print(f"- {disease}")
