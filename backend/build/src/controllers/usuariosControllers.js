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
const axios_1 = __importDefault(require("axios"));
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
            console.log('Solicitud recibida en /usuario/login'); // Depuración
            const { Correo, Contrasena, 'g-recaptcha-response': captchaResponse } = req.body;
            // Depuración: Verifica que captchaResponse no sea undefined
            console.log('Datos recibidos:', { Correo, Contrasena, captchaResponse });
            if (!captchaResponse) {
                console.error('Error: captchaResponse es undefined.');
                resp.status(400).json({ message: 'Error: No se recibió la respuesta del CAPTCHA.' });
                return;
            }
            // Verificar el CAPTCHA primero
            const secretKey = '6LeO6t0qAAAAAP6sTjj82wcVOpE5tQUIBlP1izdu'; // Reemplaza con tu Secret Key
            const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaResponse}`;
            try {
                // Verificar el CAPTCHA con Google
                const captchaVerification = yield axios_1.default.post(verificationUrl);
                console.log('Respuesta de reCAPTCHA:', captchaVerification.data);
                if (!captchaVerification.data.success) {
                    resp.status(400).json({ message: 'Error: No se pudo verificar el CAPTCHA.' });
                    return;
                }
                // Si el CAPTCHA es válido, continuar con el inicio de sesión
                const result = yield database_1.default.query('SELECT * FROM Usuarios WHERE Correo = ?', [Correo]);
                console.log('Resultado de la consulta:', result);
                if (result.length > 0) {
                    const user = result[0];
                    const isPasswordValid = yield bcrypt_1.default.compare(Contrasena, user.Contrasena);
                    console.log('¿Contraseña válida?', isPasswordValid);
                    if (isPasswordValid) {
                        const token = jsonwebtoken_1.default.sign({ id: user.Id, nombre: user.Nombre, correo: user.Correo, rol: user.Rol }, JWT_SECRET, { expiresIn: '1h' });
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
                        from: 'elizagutierrezg27@gmail.com',
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
    verifyCaptcha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const captchaResponse = req.body['g-recaptcha-response'];
            if (!captchaResponse) {
                return res.status(400).json({ message: 'Por favor, completa el CAPTCHA' });
            }
            try {
                const response = yield axios_1.default.post('https://www.google.com/recaptcha/api/siteverify', null, {
                    params: {
                        secret: '6LccFtoqAAAAABd2gjTQdP569F8wfFUIY3VKQW85',
                        response: captchaResponse,
                    },
                });
                if (response.data.success) {
                    return res.status(200).json({ message: 'Captcha válido' });
                }
                else {
                    return res.status(400).json({ message: 'Captcha inválido' });
                }
            }
            catch (error) {
                console.error('Error al verificar el CAPTCHA:', error);
                return res.status(500).json({ message: 'Error en la verificación del CAPTCHA' });
            }
        });
    }
    create(req, resp) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, correo, contrasena, rol, 'g-recaptcha-response': captchaResponse } = req.body;
                // Verificar que la contraseña esté presente
                if (!contrasena) {
                    resp.status(400).json({ message: 'La contraseña es requerida.' });
                    return;
                }
                // Verificar el CAPTCHA primero
                if (!captchaResponse) {
                    resp.status(400).json({ message: 'Error: No se recibió la respuesta del CAPTCHA.' });
                    return;
                }
                const secretKey = '6LeO6t0qAAAAAP6sTjj82wcVOpE5tQUIBlP1izdu'; // Reemplaza con tu Secret Key
                const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaResponse}`;
                const captchaVerification = yield axios_1.default.post(verificationUrl);
                if (!captchaVerification.data.success) {
                    resp.status(400).json({ message: 'Error: No se pudo verificar el CAPTCHA.' });
                    return;
                }
                // Verificar si el correo ya está registrado
                const [existingUser] = yield database_1.default.query('SELECT * FROM usuarios WHERE Correo = ?', [correo]);
                if (Array.isArray(existingUser) && existingUser.length > 0) {
                    resp.status(400).json({ message: 'El correo ya está registrado' });
                    return;
                }
                // Encriptar la contraseña
                const saltRounds = 10;
                const hashedPassword = yield bcrypt_1.default.hash(contrasena, saltRounds);
                // Insertar el nuevo usuario en la base de datos
                yield database_1.default.query('INSERT INTO usuarios SET ?', [
                    {
                        nombre,
                        correo,
                        Contrasena: hashedPassword,
                        rol
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
