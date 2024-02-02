import os
import subprocess
import tkinter as tk
import scripts

from utils.get_scripts import scan_directory_for_scripts


class MainWindow(tk.Frame):

    def __init__(self, master=None):
        super().__init__(master)
        self.master = master
        self.master.title("Script Kiddie")
        self.pack()
        self.create_widgets()

    def create_widgets(self):
        # Button to execute Script 1
        self.script1_button = tk.Button(self)
        self.script1_button["text"] = "Run Script 1"
        self.script1_button["command"] = {}
        self.script1_button.pack(side="top")

        # Button to quit the application
        self.quit_button = tk.Button(self, text="QUIT", fg="red",
                                     command=self.master.destroy)
        self.quit_button.pack(side="bottom")


