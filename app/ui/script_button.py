import subprocess
import tkinter as tk

class ScriptButton:
    def __init__(self, master, script_info):
        """
        Initializes a button for a given script.

        :param master: The parent widget.
        :param script_info: A dictionary containing the script's information.
        """
        self.master = master
        self.script_info = script_info
        self.button = tk.Button(master, text=script_info['script_title'], command=self.on_click)
        self.button.pack(pady=5)

    def on_click(self):
        """
        The function to call when the button is clicked.
        """
        subprocess.Popen(["start", "cmd", "/k", "python", self.script_info["script_path"]], shell=True)
