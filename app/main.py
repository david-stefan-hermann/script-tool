import os
import sys
import scripts
from utils.get_scripts import scan_directory_for_scripts
from ui.main_window import MainWindow
from PyQt6.QtWidgets import QApplication, QStyleFactory
from PyQt6.QtGui import QColor, QPalette
from PyQt6.QtCore import Qt


def main():
    app = QApplication(sys.argv)

    app.setStyle(QStyleFactory.create('Fusion'))

    dark_palette = QPalette()
    # dark_palette.setColor(QPalette.ColorRole.Window, QColor(255, 16, 22))
    # dark_palette.setColor(QPalette.ColorRole.WindowText, QColor(255, 255, 255))
    app.setPalette(dark_palette)

    # app.setStyleSheet("QToolTip { color: #ffffff; background-color: #2a82da; border: 1px solid white; }")


    _script_directory = os.path.dirname(scripts.__file__)
    scripts_info = scan_directory_for_scripts(_script_directory)
    
    ex = MainWindow(scripts_info)
    ex.show()
    ex.activateWindow()
    ex.raise_()
    
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
