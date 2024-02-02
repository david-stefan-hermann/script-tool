import tkinter as tk
from ui.main_window import MainWindow

def main():
    root = tk.Tk()
    app = MainWindow(master=root)
    app.mainloop()

if __name__ == "__main__":
    main()
