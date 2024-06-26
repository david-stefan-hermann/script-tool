"""
Title: Episode Counter Renamer
Description: Increment or decrement the episode counter in the file names of a directory.
"""

import os
from tkinter import filedialog
import re

# Function to rename files in a directory, more specifically to change the episode counter
# i.e. E001, E002, E003 -> E006, E007, E008


def rename_files(directory):
    print(f"Renaming files in directory: {directory} \n")
    print("The pattern to be matched is 'EXXX' where XXX is a number. \n")
    amount_to_be_added = input("Amount to be added or substracted to episode title (can be negative): ") # can be negative

    # Regex to match the pattern 'EXXX' where XXX is a number
    pattern = re.compile(r'(E\d{3})')

    for filename in os.listdir(directory):

        # Check if the file is not a Python file
        name, extension = os.path.splitext(filename)
        if extension.lower() != '.py':

            # Find the pattern in the filename
            match = pattern.search(filename)
            if match:
                # Extract the numeric part and calculate the new number
                number = int(match.group(0)[1:])  # Remove 'E' and convert to int
                new_number = max(number + int(amount_to_be_added), 1)  # Add/Subtract amount (ensure it's not negative)
                new_number_str = f'E{new_number:03}'  # Format as 'E' followed by 3 digits

                # Replace old number with new number in the filename
                new_filename = filename.replace(match.group(0), new_number_str)
                
                # Rename the file
                os.rename(os.path.join(directory, filename), os.path.join(directory, new_filename))


if __name__ == '__main__':
    rename_files(filedialog.askdirectory())
    exit()