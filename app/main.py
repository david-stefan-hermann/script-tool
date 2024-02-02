import os
import sys
import scripts
from utils.get_scripts import scan_directory_for_scripts
from ui.main_window import MainWindow
from PyQt6.QtWidgets import QApplication


def main():
    app = QApplication(sys.argv)

    _script_directory = os.path.dirname(scripts.__file__)
    scripts_info = scan_directory_for_scripts(_script_directory)
    
    ex = MainWindow(scripts_info)
    ex.show()
    
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
