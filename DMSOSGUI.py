import customtkinter
import threading
import tkinter
import DMSOS
import tkcalendar
import requests
import asyncio
from tkcalendar import DateEntry
from tkinter import Tk, ttk
from tkinter import filedialog
from customtkinter import *
import subprocess
import pexpect

def start_server():
    subprocess.Popen(["python", "DMSOS.py"])

def admOsWindow(root, token):
    #init var
    t=0
    tecnicos = []


    hideout = CTkFrame(root, bg_color='#242424', width=800, height=400)
    def initial(t=0):
        hideout.place(x=t, y=0)
        if t > 360:
            return
    initial()
    root.after(10, initial, t+1)
    root.withdraw() #Esconde widgets carregando
    adm_os_frame = CTkFrame(root)
    adm_os_frame.pack(fill=BOTH, expand=True)
    def placeLabels(root):
        global file_list_text
        def add_files():
            file_path = filedialog.askopenfilename(
                title="Select Files",
                filetypes=[("All Files", "*.*")]
            )

            if file_path:
                # Do something with the selected file path, e.g., add it to a list
                file_list.append(file_path)
                # Update the UI to display the selected files
                update_file_list()

        def update_file_list():
            file_list_text.delete(0.0, END)
            for file_path in file_list:
                file_name = os.path.basename(file_path)
                file_list_text.insert(END, file_name + "\n")
        def addTec(selectedTec, addedTec):
            print(addedTec.get(), selectedTec.get())
            addedTec.set(addedTec.get() + " " + selectedTec.get())
            
            

            
        def send_info():
            pass
        #User
        user_name = StringVar()
        
        # Contrato
        contratoNameLabel = StringVar()
        contratoNameLabel.set("Selecione o contrato: ")
        labelContrato = CTkLabel(root, textvariable=contratoNameLabel, bg_color='#2b2b2b')
        labelContrato.place(x=10, y=10)

        contrato_options = ["SOHO", "Union", "CI", "Barra Shopping", "Park Shopping CG", "Park Shopping JPA", "ICATU", "IBMEC(Centro)"] #TODO: Informações alimentadas atraves de request/call para db
        contratoName = CTkOptionMenu(root, width=100, values=contrato_options)
        contratoName.place(x=230, y=10)

        typeJobLabel = StringVar()
        typeJobLabel.set("Tipo: ")
        typeJobText = CTkLabel(root, textvariable=typeJobLabel, bg_color='#2b2b2b')
        typeJobText.place(x=370, y=10)
        typeJobOptions = ["Preventiva", "Corretiva", "Outros"]
        typeJob = CTkOptionMenu(root, width=100, values=typeJobOptions )
        typeJob.place(x=430, y=10)


        # Nome Tecnicos
        tecNameLabel = StringVar()
        tecNameLabel.set("Selecione os tecnicos responsaveis: ") #TODO: Filtrar tecnicos REGISTRADOS por contrato e disponibilidade
        labelTec = CTkLabel(root, textvariable=tecNameLabel, bg_color='#2b2b2b')
        labelTec.place(x=10, y=40)
        addedTec = StringVar()
        addedTecLabel = CTkLabel(root, textvariable=addedTec, bg_color='#2b2b2b', wraplength= 120)
        addedTecLabel.place(x=550, y=40)

        tecnicoOptions = ["Tecnico 1", "Tecnico 2"] #TODO: Alimentar lista com tecnicos registrados no DB, acessar via api
        tecName = CTkOptionMenu(root, values=tecnicoOptions, width=190)
        tecName.place(x=230, y=40)
        addTecName = CTkButton(root, text="Adicionar", width=80, command=lambda:addTec(tecName, addedTec))
        addTecName.place(x=430, y=40)
        

        # Data e Hora e widget
        date_label = StringVar()
        date_label.set("Selecione a data: ")
        start_label = StringVar()
        start_label.set("Horario do começo")
        end_label = StringVar()
        end_label.set("Horario do fim")
        labelDate = CTkLabel(root, textvariable=date_label, bg_color='#2b2b2b')
        labelDate.place(x=10, y=70)

        # Descrição

        desc_text = StringVar()
        desc_text.set("Descrição:")
        desc_label = CTkLabel(root, textvariable=desc_text, bg_color='#2b2b2b')
        desc_label.place(x=10, y=100)

        desc_box = CTkTextbox(root, width=370, height=200) 
        desc_box.place(x=10, y=130)

        #Selecionar arquivo
        file_list = []

        
        file_list_text = CTkTextbox(root, width=200, height=50)
        file_list_text.place(x=180, y=340 )


        add_files_button = CTkButton(root, text="Anexar arquivos", command=add_files)
        add_files_button.place(x=10, y=340)

        date_entry = DateEntry(root, width=12, background="white", foreground="black", locale="pt_BR")
        date_entry.place(x=230, y=70)

        #Enviar

        send_text = StringVar()
        send_text.set("Enviar")

        send_label = CTkButton(root, textvariable=send_text)
        send_label.place(x=10, y=370)
        root.deiconify() #Retorna frame apos widgets carregar
    placeLabels(root)
def loginScreen(root):
    def try_login():
        user = login_var.get()
        psw = password_var.get()

        data = {'username' : user, 'password' : psw}
        response = requests.post('http://127.0.0.1:5000/login', json=data)
        
        token = response.text
        if response.status_code == 200:
            admOsWindow(root, token)

    login_text = StringVar()
    login_text.set("Login")
    login_label = CTkLabel(root, textvariable = login_text, font = ("Arial", 25), bg_color='#2b2b2b')
    login_label.place(x = 360, y = 80)

    login_var = StringVar()
    login_field = CTkEntry(root, width=200, textvariable=login_var)
    login_field.place(x= 295, y = 110)

    password_text = StringVar()
    password_text.set("Senha")
    password_label = CTkLabel(root, textvariable= password_text, font=("Arial", 25), bg_color='#2b2b2b')
    password_label.place(x = 360, y= 140)
    password_var = StringVar()
    password_field = CTkEntry(root, width=200, textvariable=password_var)
    password_field.configure(show="*")
    password_field.place(x = 295, y = 170)

    send_text = StringVar()
    send_text.set("Enviar")
    send_button = CTkButton(root, textvariable=send_text, command=lambda:try_login())
    send_button.place(x=325, y = 200)
def gui(root):
    
    # Inicializa a pagina e define as configurações
    customtkinter.set_appearance_mode("dark")
    root.geometry('800x400')
    root.title("OS DMSYS")
    root.resizable(False, False)
    # Chama as funções
    if(is_login):
        admOsWindow(root)
    else:
        loginScreen(root)
    root.mainloop()

if __name__ == "__main__":
    start_server()
    global is_login
    is_login = False
    root = CTk()
    gui(root)