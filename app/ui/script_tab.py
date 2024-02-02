import subprocess
from PyQt6.QtWidgets import QWidget, QVBoxLayout, QPushButton, QLabel
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
        self.process = subprocess.Popen(["cmd.exe", "/c", "start", "cmd.exe", "/k", "python", self.script_info["script_path"]])

    def quit_script(self):
        self.process.terminate()