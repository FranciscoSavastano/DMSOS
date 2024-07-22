import customtkinter
import tkinter
import tkcalendar
from tkcalendar import DateEntry
from tkinter import ttk
from customtkinter import *
from tktimepicker import AnalogPicker, AnalogThemes

def placeLabels(root):
    # Contrato
    contratoNameLabel = StringVar()
    contratoNameLabel.set("Selecione o contrato: ")
    labelContrato = CTkLabel(root, textvariable=contratoNameLabel)
    labelContrato.grid(row=1, column=0, sticky="w") 

    contrato_options = ["SOHO", "Union", "CI", "Barra Shopping", "Park Shopping CG", "Park Shopping JPA", "ICATU", "IBMEC(Centro)", "Brookfield"]
    contratoName = CTkOptionMenu(root, width=100, values=contrato_options)
    contratoName.grid(row=0, column=1, padx=10, pady=5, sticky="w")

    # Nome Tecnicos
    tecNameLabel = StringVar()
    tecNameLabel.set("Insira o nome dos técnicos: ")
    labelTec = CTkLabel(root, textvariable=tecNameLabel)
    labelTec.grid(row=0, column=0, sticky="w") 

    tecnico = StringVar(None)
    tecName = CTkEntry(root, textvariable=tecnico, width=230)
    tecName.grid(row=1, column=1, padx=10, pady=5, sticky="w") 

    # Data e Hora

    date_label = StringVar()
    date_label.set("Selecione a data: ")
    start_label = StringVar()
    start_label.set("Horario do começo")
    end_label = StringVar()
    end_label.set("Horario do fim")
    labelDate = CTkLabel(root, textvariable=date_label)
    labelDate.grid(row=2, column=0, sticky="w")

    
    # Create a DateEntry widget
    date_entry = DateEntry(root, width=12, background="white", foreground="black", locale="pt_BR")
    date_entry.grid(row=2, column=1, sticky="w")
def gui(root):
    #Inicializa a pagina e define as configurações

    customtkinter.set_appearance_mode("dark")
    root.geometry('800x400')
    root.title("OS DMSYS")
    root.resizable(False,False)

    #Chama as funções
    placeLabels(root)







    root.mainloop()
root = CTk()
gui(root)