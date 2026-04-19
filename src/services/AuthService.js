import jwt from 'jsonwebtoken';
import prisma from '../../prisma/prisma.client.ts';
import { AppError } from '../utils/AppError.ts';
import { env } from '../config/env.ts';
import logger from '../config/logger.ts';
/**
 * Servicio de Usuarios y Autenticación
 */
export class AuthService {
    /**
     * Registra un nuevo usuario
     */
    async register(data) {
        try {
            const usuario = await prisma.usuario.registra(data.email, data.nombre, data.contraseña);
            logger.info(`Usuario registrado: ${usuario.email}`);
            return usuario;
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new AppError(409, 'Email ya registrado');
            }
            throw new AppError(400, `Error en registro: ${error.message}`);
        }
    }
    /**
     * Autentica usuario y devuelve JWT
     */
    async login(data) {
        try {
            const usuario = await prisma.usuario.autentifica(data.email, data.contraseña);
            const token = jwt.sign({ usuario: usuario.nombre, admin: usuario.admin }, env.SECRET_KEY);
            logger.info(`Login exitoso: ${usuario.email}`);
            return { usuario, token };
        }
        catch (error) {
            throw new AppError(401, error.message || 'Credenciales inválidas');
        }
    }
}
export const authService = new AuthService();
