import { Request, Response } from "express";
import pool from "../../database";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import axios from 'axios'; 


// Claves secretas
const JWT_SECRET = 'miClaveSecretaSuperSegura123';
const RECOVERY_SECRET = 'miClaveSecretaParaRecuperacion456';

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'elizagutierrezg27@gmail.com', // Tu correo Gmail
        pass: 'uvlg mlrf nanm xxgy' // Tu contraseña de Gmail
    }
});

class UsuariosController {
    public async list(req: Request, resp: Response): Promise<void> {
        const usuarios = await pool.query('SELECT * FROM usuarios');
        resp.json(usuarios);
    }

    public async delete(req: Request, resp: Response): Promise<void> {
        const { Id } = req.params;
        await pool.query('DELETE FROM usuarios WHERE Id = ?', [Id]);
        resp.json({ message: 'Usuario eliminado' });
    }

    public async update(req: Request, resp: Response): Promise<void> {
        const { id } = req.params;
        await pool.query('UPDATE usuarios SET ? WHERE Id = ?', [req.body, id]);
        resp.json({ message: 'Usuario actualizado' });
    }

    public async getOne(req: Request, resp: Response): Promise<void> {
        const { id } = req.params;
        const usuarios = await pool.query('SELECT * FROM usuarios WHERE Id = ?', [id]);

        if (usuarios.length > 0) {
            resp.json(usuarios[0]);
        } else {
            resp.status(404).json({ message: 'El usuario no existe' });
        }
    }

    public async login(req: Request, resp: Response): Promise<void> {
        const { Correo, Contrasena, 'g-recaptcha-response': captchaResponse } = req.body;

        // Verificar el CAPTCHA primero
        const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=6LccFtoqAAAAABd2gjTQdP569F8wfFUIY3VKQW85&response=${captchaResponse}`;

        try {
            // Verificar el CAPTCHA con Google
            const captchaVerification = await axios.post(verificationUrl);
            if (!captchaVerification.data.success) {
                resp.status(400).json({ message: 'Error: No se pudo verificar el CAPTCHA.' });
                return;
            }

            // Si el CAPTCHA es válido, continuar con el inicio de sesión
            const result = await pool.query('SELECT * FROM Usuarios WHERE Correo = ?', [Correo]);

            if (result.length > 0) {
                const user = result[0];
                const isPasswordValid = await bcrypt.compare(Contrasena, user.Contrasena);

                if (isPasswordValid) {
                    const token = jwt.sign(
                        { id: user.Id, correo: user.Correo, rol: user.Rol },
                        JWT_SECRET,
                        { expiresIn: '1h' }
                    );

                    resp.json({ message: 'Login successful', token, user });
                } else {
                    resp.status(401).json({ message: 'Correo o contraseña incorrectos' });
                }
            } else {
                resp.status(401).json({ message: 'Correo o contraseña incorrectos' });
            }
        } catch (error) {
            console.error('Error en el login:', error);
            resp.status(500).json({ message: 'Error en el servidor' });
        }
    }

    public async requestPasswordReset(req: Request, resp: Response): Promise<void> {
        const { Correo } = req.body;

        try {
            const result = await pool.query('SELECT * FROM Usuarios WHERE Correo = ?', [Correo]);

            if (result.length > 0) {
                const user = result[0];
                const resetToken = jwt.sign({ id: user.Id }, RECOVERY_SECRET, { expiresIn: '1h' });

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
                    } else {
                        resp.json({ message: 'Correo de recuperación enviado' });
                    }
                });
            } else {
                resp.status(404).json({ message: 'Correo no encontrado' });
            }
        } catch (error) {
            console.error('Error en la solicitud de recuperación:', error);
            resp.status(500).json({ message: 'Error en el servidor' });
        }
    }

    public async verifyCaptcha(req: Request, res: Response): Promise<Response> {
        const captchaResponse = req.body['g-recaptcha-response'];

        if (!captchaResponse) {
            return res.status(400).json({ message: 'Por favor, completa el CAPTCHA' });
        }

        try {
            const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
                params: {
                    secret: '6LccFtoqAAAAAMUUFKceJzzRQIri-zTvq7YMFaxf',
                    response: captchaResponse,
                },
            });

            if (response.data.success) {
                return res.status(200).json({ message: 'Captcha válido' });
            } else {
                return res.status(400).json({ message: 'Captcha inválido' });
            }
        } catch (error) {
            console.error('Error al verificar el CAPTCHA:', error);
            return res.status(500).json({ message: 'Error en la verificación del CAPTCHA' });
        }
    }

    public async create(req: Request, resp: Response): Promise<void> {
        try {
            const { Nombre, Correo, Contrasena, Rol} = req.body;
            // Verificar si el correo ya está registrado
            const [existingUser] = await pool.query('SELECT * FROM usuarios WHERE Correo = ?', [Correo]);
    
            console.log('Resultado de la consulta:', existingUser);
    
            // Verificar si existingUser es un array y tiene elementos
            if (Array.isArray(existingUser) && existingUser.length > 0) {
                resp.status(400).json({ message: 'El correo ya está registrado' });
                return;
            }
    
            // Encriptar la contraseña
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(Contrasena, saltRounds);
    
            // Insertar el nuevo usuario en la base de datos
            await pool.query('INSERT INTO usuarios SET ?', [
                { 
                    Nombre, 
                    Correo, 
                    Contrasena: hashedPassword, 
                    Rol 
                }
            ]);
    
            resp.json({ message: 'Usuario registrado exitosamente' });
        } catch (error) {
            console.error('Error al registrar el usuario:', error);
            resp.status(500).json({ message: 'Error al registrar el usuario', error });
        }
    }
}

const usuarioController = new UsuariosController();
export default usuarioController;