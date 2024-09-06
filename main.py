import subprocess

def start_program():
    subprocess.Popen(["python", "DMSOS.py"])
    subprocess.Popen(["python", "DMSOSQT.py"])

start_program()