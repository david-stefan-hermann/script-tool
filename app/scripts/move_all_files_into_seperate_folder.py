"""
Title: Move All Files into Separate Folders
Description: Automatically organize video files in the current directory, placing each into a newly created folder named after the file but with underscores replaced by spaces and content in parentheses removed.
"""
# Description
# The program automatically organizes video files in the current directory, 
# placing each into a newly created folder named after the file but with 
# underscores replaced by spaces and content in parentheses removed.

# Beschreibung
# Das Programm organisiert automatisch Videodateien im aktuellen Verzeichnis, 
# indem es jede in einen neu erstellten Ordner verschiebt, der nach der Datei 
# benannt ist, wobei Unterstriche durch Leerzeichen ersetzt und Inhalte in 
# Klammern entfernt werden.

import os
from tkinter import filedialog

# Automatically organize files in the current directory when the script is run
def organize_files(directory):

    # Define video file extensions
    video_extensions = ('.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv')

    # Iterate over each file in the directory
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)

        # Skip directories and non-video files
        if os.path.isdir(file_path) or not filename.lower().endswith(video_extensions):
            continue

        # Modify the folder name
        folder_name = filename.split('.')[0]  # Remove file extension
        folder_name = folder_name.replace("_", " ")  # Replace '_' with ' '
        folder_name = ''.join(folder_name.split('(')[0]).strip()  # Remove parentheses and their content

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
