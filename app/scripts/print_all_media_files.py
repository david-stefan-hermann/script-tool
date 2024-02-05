"""
Title: Print all media files
Description: Print all media files in selected directories
"""

import os
import tkinter as tk
import tkinter.filedialog as filedialog

# Function to get the list of media files in a directory
def get_media_files(directory):
    media_files = []
    for _, _, files in os.walk(directory):
        for file in files:
            if is_media_file(file):
                media_files.append(file)
    return media_files

# Function to check if a file is a media file
def is_media_file(file):
    media_extensions = ['.mp3', '.mp4', '.avi', '.mkv', '.jpg', '.jpeg', '.png']
    file_extension = os.path.splitext(file)[1].lower()
    return file_extension in media_extensions

# Function to print the list of media files in selected directories
def print_all_media_files(directory):
    media_files = get_media_files(directory)
    print(f"Media files in {directory}:")
    for file in media_files:
        print(file)
    return media_files

# Function to save the list of media files to a file
def save_media_files(media_files, save_location):
    with open(save_location, 'w') as file:
        file.write(f"Media files in {os.path.basename(directory)}:\n")
        for media_file in media_files:
            file.write(media_file + '\n')


if __name__ == "__main__":
    # Create a Tkinter window to select directories
    root = tk.Tk()
    root.withdraw()

    # Ask the user to select directory
    directory = filedialog.askdirectory()

    if not directory:
        print("No directory selected.")
        exit()

    # Print the list of media files in selected directories
    media_files = print_all_media_files(directory)

    # Ask the user if they want to save the list of media files
    save_option = input("Do you want to save the list of media files? (y/n): ")
    if save_option.lower() == 'y':
        # Ask the user to select a save location
        save_location = filedialog.asksaveasfilename(defaultextension=".txt", initialfile=f"{os.path.basename(directory)}.txt")
        # Save the list of media files to the selected location
        save_media_files(media_files, save_location)