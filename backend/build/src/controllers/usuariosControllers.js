"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../../database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
// Claves secretas
const JWT_SECRET = 'miClaveSecretaSuperSegura123';
const RECOVERY_SECRET = 'miClaveSecretaParaRecuperacion456';
// Configuración de Nodemailer
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: 'elizagutierrezg27@gmail.com', // Tu correo Gmail
        pass: 'uvlg mlrf nanm xxgy' // Tu contraseña de Gmail
    }
});
class UsuariosController {
    list(req, resp) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuarios = yield database_1.default.query('SELECT * FROM usuarios');
            resp.json(usuarios);
        });
    }
    delete(req, resp) {
        return __awaiter(this, void 0, void 0, function* () {
            const { Id } = req.params;
            yield database_1.default.query('DELETE FROM usuarios WHERE Id = ?', [Id]);
            resp.json({ message: 'Usuario eliminado' });
        });
    }
    update(req, resp) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            yield database_1.default.query('UPDATE usuarios SET ? WHERE Id = ?', [req.body, id]);
            resp.json({ message: 'Usuario actualizado' });
        });
    }
    getOne(req, resp) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const usuarios = yield database_1.default.query('SELECT * FROM usuarios WHERE Id = ?', [id]);
            if (usuarios.length > 0) {
                resp.json(usuarios[0]);
            }
            else {
                resp.status(404).json({ message: 'El usuario no existe' });
            }
        });
    }
    login(req, resp) {
        return __awaiter(this, void 0, void 0, function* () {
            const { Correo, Contrasena } = req.body;
            try {
                const result = yield database_1.default.query('SELECT * FROM Usuarios WHERE Correo = ?', [Correo]);
                if (result.length > 0) {
                    const user = result[0];
                    const isPasswordValid = yield bcrypt_1.default.compare(Contrasena, user.Contrasena);
                    if (isPasswordValid) {
                        const token = jsonwebtoken_1.default.sign({ id: user.Id, correo: user.Correo, rol: user.Rol }, JWT_SECRET, { expiresIn: '1h' });
                        resp.json({ message: 'Login successful', token, user });
                    }
                    else {
                        resp.status(401).json({ message: 'Correo o contraseña incorrectos' });
                    }
                }
                else {
                    resp.status(401).json({ message: 'Correo o contraseña incorrectos' });
                }
            }
            catch (error) {
                console.error('Error en el login:', error);
                resp.status(500).json({ message: 'Error en el servidor' });
            }
        });
    }
    requestPasswordReset(req, resp) {
        return __awaiter(this, void 0, void 0, function* () {
            const { Correo } = req.body;
            try {
                const result = yield database_1.default.query('SELECT * FROM Usuarios WHERE Correo = ?', [Correo]);
                if (result.length > 0) {
                    const user = result[0];
                    const resetToken = jsonwebtoken_1.default.sign({ id: user.Id }, RECOVERY_SECRET, { expiresIn: '1h' });
                    const mailOptions = {
                        from: 'tucorreo@gmail.com',
                        to: Correo,
                        subject: 'Recuperación de contraseña',
                        text: `Haz clic en el siguiente enlace para restablecer tu contraseña: http://localhost4200/reset-password?token=${resetToken}`
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error('Error al enviar el correo:', error);
                            resp.status(500).json({ message: 'Error al enviar el correo' });
                        }
                        else {
                            resp.json({ message: 'Correo de recuperación enviado' });
                        }
                    });
                }
                else {
                    resp.status(404).json({ message: 'Correo no encontrado' });
                }
            }
            catch (error) {
                console.error('Error en la solicitud de recuperación:', error);
                resp.status(500).json({ message: 'Error en el servidor' });
            }
        });
    }
    create(req, resp) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { Nombre, Correo, Contrasena, Rol } = req.body;
                console.log('Datos recibidos:', { Nombre, Correo, Contrasena, Rol });
                // Validar que todos los campos estén presentes
                if (!Nombre || !Correo || !Contrasena || !Rol) {
                    resp.status(400).json({ message: 'Todos los campos son necesarios' });
                    return;
                }
                // Verificar si el correo ya está registrado
                const [existingUser] = yield database_1.default.query('SELECT * FROM usuarios WHERE Correo = ?', [Correo]);
                console.log('Resultado de la consulta:', existingUser);
                // Verificar si existingUser es un array y tiene elementos
                if (Array.isArray(existingUser) && existingUser.length > 0) {
                    resp.status(400).json({ message: 'El correo ya está registrado' });
                    return;
                }
                // Encriptar la contraseña
                const saltRounds = 10;
                const hashedPassword = yield bcrypt_1.default.hash(Contrasena, saltRounds);
                // Insertar el nuevo usuario en la base de datos
                yield database_1.default.query('INSERT INTO usuarios SET ?', [
                    {
                        Nombre,
                        Correo,
                        Contrasena: hashedPassword,
                        Rol
                    }
                ]);
                resp.json({ message: 'Usuario registrado exitosamente' });
            }
            catch (error) {
                console.error('Error al registrar el usuario:', error);
                resp.status(500).json({ message: 'Error al registrar el usuario', error });
            }
        });
    }
}
const usuarioController = new UsuariosController();
exports.default = usuarioController;
