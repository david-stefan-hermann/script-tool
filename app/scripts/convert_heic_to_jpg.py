"""
Title: convert HEIC to JPG
Description: This Python script uses Pillow and pillow_heif to 
convert all .heic images in a user-selected directory to .jpg format, 
saving the converted images in a subfolder named converted_images.
"""

import os
from PIL import Image
import pillow_heif
import tkinter as tk
from tkinter import filedialog
import sys

def convert_heic_to_jpg(source_folder):
    # Register HEIF format for Pillow
    pillow_heif.register_heif_opener()

    # Create a subfolder for the converted images
    output_folder = os.path.join(source_folder, 'converted_images')
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Process each file in the source folder
    for filename in os.listdir(source_folder):
        if filename.lower().endswith('.heic'):
            heic_path = os.path.join(source_folder, filename)
            jpg_path = os.path.join(output_folder, f"{os.path.splitext(filename)[0]}.jpg")

            try:
                # Open HEIC file using Pillow
                image = Image.open(heic_path)

                # Save as JPG
                image.save(jpg_path, "JPEG")
                print(f"Converted {filename} to {jpg_path}")
            except Exception as e:
                print(f"Failed to convert {filename}: {e}")

    # Open the output folder in the file explorer
    try:
        if sys.platform == 'win32':
            os.startfile(output_folder)
        elif sys.platform == 'darwin':
            subprocess.call(['open', output_folder])
        else:
            subprocess.call(['xdg-open', output_folder])
    except Exception as e:
        print(f"Failed to open the folder: {e}")

def choose_directory():
    root = tk.Tk()
    root.withdraw()  # Hide the main window
    try:
        source_folder = filedialog.askdirectory(title="Select Folder with .heic images")
        if source_folder:
            if not os.path.isdir(source_folder):
                print(f"The provided path '{source_folder}' is not a valid directory.")
                sys.exit(1)

            convert_heic_to_jpg(source_folder)
            print("Conversion completed.")
        else:
            print("No folder selected.")
            sys.exit(1)
    except Exception as e:
        print(f"Error selecting directory: {e}")
        sys.exit(1)

if __name__ == "__main__":
    choose_directory()
