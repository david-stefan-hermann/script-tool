import os
import subprocess
import tkinter as tk
from tkinter import ttk


class MainWindow(tk.Frame):

    def __init__(self, master=None):
        super().__init__(master)
        self.master = master
        self.master.title("Script Kiddie")
        self.pack()
        self.create_widgets()

    def create_widgets(self):
        # Button to quit the application
        self.quit_button = tk.Button(self, text="QUIT", fg="red", command=self.master.destroy)
        self.quit_button.pack(side="bottom")
