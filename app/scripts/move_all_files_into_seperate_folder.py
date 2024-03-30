"""
Title: Move All Files into Separate Folders
Description: The program automatically organizes video files in the current directory, placing each into a newly created folder named after the file. Underscores are replaced by spaces and content in parentheses can optionally be removed.
"""

# Description
# The program automatically organizes video files in the current directory, 
# placing each into a newly created folder named after the file. Underscores 
# are replaced by spaces and content in parentheses can optionally be removed.

import os
from tkinter import filedialog
import re

# Automatically organize files in the current directory when the script is run
def organize_files(directory):

    # Define video file extensions
    video_extensions = ('.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv')

    # Ask user if they want to remove content in parentheses from folder names
    remove_content_from_parentheses = input("Do you want to remove content in parentheses from folder names? (y/n): ").lower() == 'y'

    # Iterate over each file in the directory
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)

        # Skip directories and non-video files
        if os.path.isdir(file_path) or not filename.lower().endswith(video_extensions):
            continue

        # Modify the folder name
        folder_name = filename.split('.')[0]  # Remove file extension
        folder_name = folder_name.replace("_", " ")  # Replace '_' with ' '
        
        if remove_content_from_parentheses:
            # Remove parentheses and their content from folder_name
            folder_name = re.sub(r'\([^()]*\)', '', folder_name).strip()

        # Create a new folder path
        new_folder_path = os.path.join(directory, folder_name)

        # Create folder if it doesn't exist
        if not os.path.exists(new_folder_path):
            os.makedirs(new_folder_path)

        # Move the file to the new folder
        new_file_path = os.path.join(new_folder_path, filename)
        os.rename(file_path, new_file_path)

    print("Files organized successfully.")


if __name__ == '__main__':
    organize_files(filedialog.askdirectory())
    exit()
