import sys
from PyQt5.QtWidgets import (
    QApplication,
    QMainWindow,
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QListWidget,
    QCheckBox,
    QTimeEdit,
    QLineEdit,
    QPushButton,
    QTextEdit,
    QDateEdit,
    QFileDialog,
    QGroupBox,
    QComboBox
)
from PyQt5.QtCore import Qt, QSize
from PyQt5.QtGui import QFont
import requests

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.is_login = False
        self.token = None
        self.tecnico_options = ["Tecnico 1", "Tecnico 2"]  # Placeholder values
        self.contrato_options = ["SOHO", "Union", "CI"]  # Placeholder values

        self.init_ui()

    def init_ui(self):
        self.setWindowTitle("OS DMSYS")
        self.setFixedSize(QSize(800, 400))

        self.central_widget = QWidget(self)
        self.setCentralWidget(self.central_widget)

        self.main_layout = QVBoxLayout(self.central_widget)

        if not self.is_login:
            self.create_login_screen()
        else:
            self.create_adm_os_window()

        self.show()

    def create_contrato_section(self):
        contrato_section = QGroupBox("Contrato")  # Create a group box for contract selection
        contrato_layout = QHBoxLayout(contrato_section)  # Create a layout for the group box

        contrato_label = QLabel("Selecione o contrato:")  # Create a label for contract selection
        contrato_layout.addWidget(contrato_label)

        contrato_options = QComboBox(self)  # Create a combo box for contract types
        contrato_options.addItems(self.contrato_options)  # Add contract options from your list
        contrato_layout.addWidget(contrato_options)

        contrato_section.setLayout(contrato_layout)  # Set the layout for the group box
        return contrato_section  # Return the created section
    def create_tipo_section(self):
        tipo_section = QGroupBox("Tipo")
        tipo_layout = QHBoxLayout(tipo_section)

        tipo_label = QLabel("Selecione o tipo:")
        tipo_layout.addWidget(tipo_label)

        tipo_options = QComboBox(self)  # Create the QComboBox
        tipo_options.insertItem(0, "Teste")
        tipo_layout.addWidget(tipo_options)

        tipo_section.setLayout(tipo_layout)
        return tipo_section
    def create_tecnicos_section(self):
        tecnicos_section = QGroupBox("Técnicos")
        tecnicos_layout = QVBoxLayout(tecnicos_section)

        tecnicos_label = QLabel("Selecione os técnicos responsáveis:")
        tecnicos_layout.addWidget(tecnicos_label)

        for tecnico in self.tecnico_options:
            checkbox = QCheckBox(tecnico)
            tecnicos_layout.addWidget(checkbox)

        tecnicos_section.setLayout(tecnicos_layout)
        return tecnicos_section

    def create_data_hora_section(self):
        data_hora_section = QGroupBox("Data e Hora")
        data_hora_layout = QHBoxLayout(data_hora_section)

        data_label = QLabel("Data:")
        data_hora_layout.addWidget(data_label)

        data_edit = QDateEdit(self)
        data_hora_layout.addWidget(data_edit)

        hora_label = QLabel("Hora:")
        data_hora_layout.addWidget(hora_label)

        hora_edit = QTimeEdit(self)
        data_hora_layout.addWidget(hora_edit)

        data_hora_section.setLayout(data_hora_layout)
        return data_hora_section

    def create_descricao_section(self):
        descricao_section = QGroupBox("Descrição")
        descricao_layout = QVBoxLayout(descricao_section)

        descricao_label = QLabel("Digite a descrição:")
        descricao_layout.addWidget(descricao_label)

        descricao_edit = QTextEdit(self)
        descricao_layout.addWidget(descricao_edit)

        descricao_section.setLayout(descricao_layout)
        return descricao_section

    def create_files_section(self):
        files_section = QGroupBox("Arquivos")
        files_layout = QVBoxLayout(files_section)

        files_label = QLabel("Selecione os arquivos:")
        files_layout.addWidget(files_label)

        files_button = QPushButton("Adicionar Arquivos")
        files_layout.addWidget(files_button)

        files_list = QListWidget(self)
        files_layout.addWidget(files_list)

        files_section.setLayout(files_layout)
        return files_section

    def create_login_screen(self):
        login_screen = QWidget(self.central_widget)
        login_layout = QVBoxLayout(login_screen)

        login_label = QLabel("Login", login_screen)
        login_label.setFont(QFont("Arial", 25))
        login_layout.addWidget(login_label, alignment=Qt.AlignCenter)

        login_field = QLineEdit(login_screen)
        login_field.setPlaceholderText("Login")
        login_layout.addWidget(login_field)

        password_label = QLabel("Senha", login_screen)
        password_label.setFont(QFont("Arial", 25))
        login_layout.addWidget(password_label, alignment=Qt.AlignCenter)

        password_field = QLineEdit(login_screen)
        password_field.setEchoMode(QLineEdit.Password)
        password_field.setPlaceholderText("Senha")
        login_layout.addWidget(password_field)

        login_button = QPushButton("Enviar", login_screen)
        login_button.clicked.connect(lambda: self.try_login(login_field.text(), password_field.text()))
        login_layout.addWidget(login_button, alignment=Qt.AlignCenter)

        login_layout.setSpacing(20)
        login_screen.setLayout(login_layout)
        self.main_layout.addWidget(login_screen)

    def try_login(self, username, password):
        # Simulate login (replace with actual authentication logic)
        data = {'username' : username, 'password' : password}
        response = requests.post('http://127.0.0.1:5000/login', json=data)
        if response.status_code == 200:
            self.create_adm_os_window()
    def send_info(self):
        pass
    def create_adm_os_window(self):
            # Get the current layout
        current_layout = self.central_widget.layout()

        # Remove all existing widgets
        for i in range(current_layout.count()):
            current_layout.takeAt(0).widget().deleteLater()

        adm_os_window = QWidget(self.central_widget)
        adm_os_layout = QVBoxLayout(adm_os_window)

        # Organize layout into sections (contrato, tipo, tecnicos, data/hora, descricao, files)
        contrato_section = self.create_contrato_section()
        tipo_section = self.create_tipo_section()
        tecnicos_section = self.create_tecnicos_section()
        data_hora_section = self.create_data_hora_section()
        descricao_section = self.create_descricao_section()
        files_section = self.create_files_section()

        adm_os_layout.addWidget(contrato_section)
        adm_os_layout.addWidget(tipo_section)
        adm_os_layout.addWidget(tecnicos_section)
        adm_os_layout.addWidget(data_hora_section)
        adm_os_layout.addWidget(descricao_section)
        adm_os_layout.addWidget(files_section)

        send_button = QPushButton("Enviar", adm_os_window)
        send_button.clicked.connect(lambda:self.send_info())  # Implement send logic here

if __name__ == "__main__":
    app = QApplication(sys.argv) 
    window = MainWindow()
    window.show()
    app.exec_()