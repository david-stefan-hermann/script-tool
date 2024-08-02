"""
Title: Episode Name Appender
Description: Rename media files in a directory with episode names from a .txt file in the same directory.
"""

import os
import sys
from tkinter import filedialog
import re

def get_media_files(directory):
    media_extensions = ('.mp4', '.mkv', '.avi', '.mov')
    media_files = [f for f in os.listdir(directory) if f.endswith(media_extensions)]
    return media_files

def get_first_txt_file(directory):
    for file in os.listdir(directory):
        if file.endswith('.txt'):
            return file
    return None

def sanitize_filename(filename):
    return re.sub(r'[<>:"/\\|?*]', '_', filename)

def rename_files(directory, media_files, titles):
    for i, media_file in enumerate(media_files):
        title = titles[i].strip()
        sanitized_title = sanitize_filename(title)
        old_path = os.path.join(directory, media_file)
        new_name = f"{os.path.splitext(media_file)[0]} - {sanitized_title}{os.path.splitext(media_file)[1]}"
        new_path = os.path.join(directory, new_name)
        os.rename(old_path, new_path)
        print(f"Renamed '{old_path}' to '{new_path}'")

def main(directory):
    os.chdir(directory)
    
    print(f"Current directory: {directory}")
    
    media_files = get_media_files(directory)
    if not media_files:
        print("No media files found.")
        sys.exit()
    
    print(f"Found {len(media_files)} media files.")
    
    txt_file = get_first_txt_file(directory)
    if not txt_file:
        print("No .txt file found.")
        sys.exit()
    
    print(f"Using titles from: {txt_file}")
    
    with open(txt_file, 'r', encoding='utf-8') as file:
        titles = file.readlines()
    
    if len(media_files) != len(titles):
        print("The number of media files does not match the number of titles in the .txt file.")
        sys.exit()
    
    rename_files(directory, media_files, titles)
    
    print("All files have been renamed.")
    
    input("Press Enter to close...")

if __name__ == "__main__":
    directory = filedialog.askdirectory()

    if not directory:
        print("No directory selected.")
        exit()
        
    main(directory)