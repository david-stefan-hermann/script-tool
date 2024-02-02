import os
from PIL import Image

def resize_image(input_image_path, output_image_path, size):
    original_image = Image.open(input_image_path)
    width, height = original_image.size
    aspect = width / float(height)

    new_width = size
    new_height = size

    if aspect > 1:  # landscape
        new_height = int(size / aspect)
    else:  # portrait
        new_width = int(size * aspect)

    resized_image = original_image.resize((new_width, new_height), Image.Resampling.LANCZOS)
    background = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    offset = (int((size - new_width) / 2), int((size - new_height) / 2))
    background.paste(resized_image, offset)
    background.save(output_image_path)

def resize_images_in_folder(folder):
    if not os.path.exists(folder + '/resized'):
        os.makedirs(folder + '/resized')

    for filename in os.listdir(folder):
        if filename.endswith('.jpg') or filename.endswith('.png'):
            resize_image(folder + '/' + filename, folder + '/resized/' + filename, 32)

resize_images_in_folder('./')