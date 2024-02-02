from PyQt6.QtWidgets import QApplication, QPushButton, QStackedWidget, QVBoxLayout, QWidget, QHBoxLayout, QLabel
import sys
from ui.script_tab import ScriptTab
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QFont
from PyQt6.QtWidgets import QApplication, QPushButton, QStackedWidget, QVBoxLayout, QWidget, QHBoxLayout, QLabel

class MainWindow(QWidget):
    def __init__(self, scripts_info, parent=None):
        super(MainWindow, self).__init__(parent)

        # Set the window title
        self.setWindowTitle("Script Kiddie")

        # Set the background color
        self.setStyleSheet("""
            background-color: '#1F2937';
            font-family: 'Arial';
        """)

        self.main_layout = QVBoxLayout(self)

        # Add a headline
        self.headline = QLabel("Script Kiddie", self)
        self.headline.setStyleSheet("color: 'white'; font-size: 24px; padding: 10px; border-bottom: 1px solid #FFF;")
        self.headline.setAlignment(Qt.AlignmentFlag.AlignCenter)  # Center the headline
        self.main_layout.addWidget(self.headline)

        self.content_layout = QHBoxLayout()
        self.main_layout.addLayout(self.content_layout)

        self.buttons_layout = QVBoxLayout()
        self.content_layout.addLayout(self.buttons_layout)

        self.stacked_widget = QStackedWidget(self)
        self.stacked_widget.setMaximumWidth(400)  # Set maximum width
        self.content_layout.addWidget(self.stacked_widget)

        self.buttons = []

        for script_info in scripts_info:
            tab = ScriptTab(script_info)
            self.stacked_widget.addWidget(tab)

            button = QPushButton(script_info['script_title'], self)
            button.setStyleSheet("""
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
            button.clicked.connect(self.button_clicked)
            self.buttons_layout.addWidget(button)
            self.buttons.append(button)

        # Make the first button active
        if self.buttons:
            self.buttons[0].click()

    def button_clicked(self):
        sender = self.sender()
        for button in self.buttons:
            if button is sender:
                button.setStyleSheet("""
                    QPushButton {
                        padding: 10px;
                        border: none;
                        color: white;
                        background-color: #004085;
                        font-size: 14px;
                    }
                """)
                self.stacked_widget.setCurrentIndex(self.buttons.index(button))
            else:
                button.setStyleSheet("""
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