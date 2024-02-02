import tkinter as tk
import subprocess
import os
import tkinter as tk
from tkinter import ttk
import subprocess
import os

def run_script1():
    subprocess.run(["python", os.path.join(os.path.dirname(__file__), "script1.py")])

def run_script2():
    subprocess.run(["python", os.path.join(os.path.dirname(__file__), "script2.py")])

def run_script1():
    subprocess.run(["python", os.path.join(os.path.dirname(__file__), "script1.py")])

def run_script2():
    subprocess.run(["python", os.path.join(os.path.dirname(__file__), "script2.py")])

root = tk.Tk()
root.title("Script Runner")

frame = ttk.Frame(root, padding=20)
frame.pack()

button1 = ttk.Button(frame, text="Run script1", command=run_script1)
button1.pack(pady=10)

button2 = ttk.Button(frame, text="Run script2", command=run_script2)
button2.pack(pady=10)

root.mainloop()
if __name__ == '__main__':
    root.mainloop()