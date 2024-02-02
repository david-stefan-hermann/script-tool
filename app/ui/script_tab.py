import subprocess
import threading
import tkinter as tk
from tkinter import ttk
from queue import Queue, Empty

# class ScriptTab:
#     def __init__(self, master, script_info):
#         """
#         Initializes a tab for a given script.

#         :param master: The parent widget.
#         :param script_info: A dictionary containing the script's information.
#         """
#         self.master = master
#         self.script_info = script_info

#         # Create a new tab
#         self.tab = ttk.Frame(master)
#         master.add(self.tab, text=script_info['script_title'])

#         # Create a frame for the buttons
#         self.button_frame = tk.Frame(self.tab)
#         self.button_frame.pack(side='left', fill='y')

#         # Add a button to run the script
#         self.run_button = tk.Button(self.button_frame, text="Run Script", command=self.run_script)
#         self.run_button.pack(pady=5)

#         # Add a button to quit the script
#         self.quit_button = tk.Button(self.button_frame, text="Quit Script", command=self.quit_script)
#         self.quit_button.pack(pady=5)

#         # Add a text widget to the tab
#         self.text = tk.Text(self.tab)
#         self.text.pack(side='right', fill='both', expand=True)

#         self.process = None

#     def run_script(self):
#         """
#         The function to call when the Run Script button is clicked.
#         """
#         self.process = subprocess.Popen(["cmd.exe", "/c", "start", "cmd.exe", "/k", "python", self.script_info["script_path"]])

#     def quit_script(self):
#         """
#         The function to call when the Quit Script button is clicked.
#         """
#         if self.process is not None:
#             self.process.terminate()
#             self.process = None


from PyQt6.QtWidgets import QWidget, QVBoxLayout, QPushButton, QTextEdit, QLabel
from PyQt6.QtCore import QProcess


class ScriptTab(QWidget):
    def __init__(self, script_info, parent=None):
        super(ScriptTab, self).__init__(parent)
        self.script_info = script_info

        self.layout = QVBoxLayout(self)

        # Add a label for the title
        self.title = QLabel(self.script_info["script_title"], self)
        self.title.setStyleSheet("color: white; font-size: 20px; padding: 10px;")
        self.layout.addWidget(self.title)

        # Add a button to run the script
        self.run_button = QPushButton("Run Script", self)
        self.run_button.setStyleSheet("""
            QPushButton {
                padding: 10px;
                border: none;
                color: white;
                background-color: #007BFF;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #0056b3;
            }
            QPushButton:pressed {
                background-color: #004085;
            }
        """)

        # Add a label for the description
        self.description = QLabel(self.script_info["script_description"], self)
        self.description.setStyleSheet("color: white; font-size: 14px; padding: 10px;")
        self.layout.addWidget(self.description)

        self.run_button.clicked.connect(self.run_script)
        self.layout.addWidget(self.run_button)

        # Add a stretch to push the content to the top
        self.layout.addStretch(1)

        self.process = QProcess(self)

    def run_script(self):
        self.process.start("python", [self.script_info["script_path"]])

    def quit_script(self):
        self.process.terminate()