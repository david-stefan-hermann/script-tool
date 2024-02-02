import os
import tkinter as tk
import scripts
from ui.script_button import ScriptButton
from utils.get_scripts import scan_directory_for_scripts
from ui.main_window import MainWindow

def main():
    root = tk.Tk()
    app = MainWindow(master=root)

    _script_directory = os.path.dirname(scripts.__file__)
    _scripts_info = scan_directory_for_scripts(_script_directory)
    for script in _scripts_info:
        print(f"Path: {script['script_path']}, Title: {script['script_title']}, Description: {script['script_description']}")
    
    for script in _scripts_info:
        # Pass the 'run_script' method as the action for the button
        ScriptButton(app, script)

    app.mainloop()

if __name__ == "__main__":
    main()
