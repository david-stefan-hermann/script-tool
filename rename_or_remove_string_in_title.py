import os

# Path of the directory where the files are located
directory_path = '.'
string_to_replace = input("String to replace (example: 'S05'):")
replace_by = input("String to replace (example: 'S06'):")

# Loop through each file in the directory
for filename in os.listdir(directory_path):
    # Check if the filename contains the specific string
    if string_to_replace in filename:
        # Create a new filename by removing the specific string
        new_filename = filename.replace(string_to_replace, replace_by)
        # Rename the file
        os.rename(os.path.join(directory_path, filename), os.path.join(directory_path, new_filename))

# Print completion message
print("Files have been renamed successfully.")
