"""
Title: Rename or Remove String in Title
Description: Rename or remove a specific string in the title of files in a directory.
"""

import os
from tkinter import filedialog

def rename_or_remove_string_in_title(directory):

    string_to_replace = input("String to replace (example: 'S05'):")
    replace_by = input("String to replace by (example: 'S06'):")

    # Loop through each file in the directory
    for filename in os.listdir(directory):
        # Check if the filename contains the specific string
        if string_to_replace in filename:
            # Create a new filename by removing the specific string
            new_filename = filename.replace(string_to_replace, replace_by)
            # Rename the file
            os.rename(os.path.join(directory, filename), os.path.join(directory, new_filename))

    # Print completion message
    print("Files have been renamed successfully.")


if __name__ == '__main__':
    rename_or_remove_string_in_title(filedialog.askdirectory())
