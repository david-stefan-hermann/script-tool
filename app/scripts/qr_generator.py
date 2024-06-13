"""
Title: QR Code Generator
Description: This Python script enables users to input a URL and select a save location to generate and save a QR code linking to the specified URL."""
import os
import qrcode
from tkinter import filedialog
from tkinter import Tk

def generate_qr_code():
    # Ask user for the URL
    url = input("Enter the URL you want to convert into a QR code: ")

    # Setting up a Tkinter root window
    root = Tk()
    root.withdraw()  # Hide the main window

    # Ask user to select the save location and file name
    file_path = filedialog.asksaveasfilename(
        defaultextension='.png',
        filetypes=[("PNG files", '*.png'), ("JPEG files", '*.jpg')],
        title="Select where to save the QR code",
        initialfile = url + ".png"
    )
    # Check if a file path was selected
    if file_path:
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(url)
        qr.make(fit=True)

        # Create an image from the QR Code instance
        img = qr.make_image(fill_color="black", back_color="white")

        # Save the image
        img.save(file_path)
        print(f"QR Code successfully saved at {file_path}")
    else:
        print("No file selected. QR code generation aborted.")

if __name__ == "__main__":
    generate_qr_code()
    os.system('exit')