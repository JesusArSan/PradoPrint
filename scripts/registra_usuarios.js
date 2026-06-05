import prisma from '../prisma/prisma.client';
import logger from '../src/config/logger';
import * as bcrypt from 'bcrypt';
const registra_usuarios = async () => {
    try {
        logger.info('Registrando usuarios de prueba...');
        const testUsers = [
            {
                email: 'admin@prado.es',
                nombre: 'Administrador',
                password: 'admin123',
                admin: true,
            },
            {
                email: 'user@prado.es',
                nombre: 'Usuario',
                password: 'user123',
                admin: false,
            },
        ];
        // Limpiar usuarios anteriores (opcional)
        // await prisma.usuario.deleteMany();
        for (const user of testUsers) {
            const exists = await prisma.usuario.findUnique({
                where: { email: user.email },
            });
            if (!exists) {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                await prisma.usuario.create({
                    data: {
                        email: user.email,
                        nombre: user.nombre,
                        contraseña: hashedPassword,
                        admin: user.admin,
                    },
                });
                logger.info(`Usuario creado: ${user.email} (admin: ${user.admin})`);
            }
            else {
                logger.info(`Usuario ya existe: ${user.email}`);
            }
        }
        logger.info('Usuarios registrados correctamente');
    }
    catch (error) {
        logger.error('Error registrando usuarios:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
};
// Ejecutar
registra_usuarios();
