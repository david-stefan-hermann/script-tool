import os
import tkinter
import scripts
from ui.script_tab import ScriptTab
from ui.script_button import ScriptButton
from utils.get_scripts import scan_directory_for_scripts
from ui.main_window import MainWindow
from ttkthemes import ThemedTk
from PyQt6.QtWidgets import QApplication, QTabWidget, QVBoxLayout, QWidget, QLabel
import sys
from PyQt6.QtGui import QPalette, QColor
from PyQt6.QtCore import Qt


def main():
    app = QApplication(sys.argv)

    _script_directory = os.path.dirname(scripts.__file__)
    scripts_info = scan_directory_for_scripts(_script_directory)
    
    ex = MainWindow(scripts_info)
    ex.show()
    
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
