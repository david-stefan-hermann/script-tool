"""
Title: Print all file sizes
Description: Print all files or directories sizes in selected directory
"""

import os
import sys
from tkinter import filedialog

def get_size(path):
    total = 0
    if os.path.isfile(path):
        total += os.path.getsize(path)
    elif os.path.isdir(path):
        for entry in os.scandir(path):
            total += get_size(entry.path)
    return total

def scan_directory(directory):
    file_data = []
    for entry in os.scandir(directory):
        size_bytes = get_size(entry.path)
        size_mb = size_bytes / (1024 * 1024)  # Convert size to MB
        if size_mb > 1024:
            size_gb = size_mb / 1024
            size_str = f"{size_gb:.2f} GB"
        else:
            size_str = f"{size_mb:.2f} MB"
        file_data.append((os.path.basename(entry.path), size_str, size_bytes))
        print(f"Path: {os.path.basename(entry.path)}: | Size: {size_str}")


    save_option = input("Do you want to save the data as a .txt file? (y/n): ")
    if save_option.lower() == "y":
        file_data.sort(key=lambda x: x[2], reverse=True)  # Sort by size in bytes
        save_file_data([(path, size_str) for path, size_str, _ in file_data])  # Save only path and size_str

    sys.exit()

def save_file_data(file_data):
    # Ask the user to select a save location
    save_location = filedialog.asksaveasfilename(defaultextension=".txt", initialfile=f"{os.path.basename(directory)}.txt")

    with open(save_location, "w") as file:
        file.write(f"File sizes in {os.path.basename(directory)}:\n")
        for file_path, file_size in file_data:
            file.write(f"File: {file_path} | Size: {file_size} bytes\n")
    print("Data saved successfully!")



if __name__ == "__main__":
    # Ask the user to select directory
    directory = filedialog.askdirectory()

    if not directory:
        print("No directory selected.")
        exit()
    
    scan_directory(directory)
