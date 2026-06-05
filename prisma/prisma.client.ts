import 'dotenv/config';
import { PrismaClient } from './generated/client.ts'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

// Extendemos el cliente con métodos propios para usuarios
const prisma = new PrismaClient({ adapter }).$extends({
  model: {
    usuario: {

      // Registra un usuario nuevo hasheando la contraseña antes de guardarla
      async registra(email: string, nombre: string, contraseña: string, admin = false) {
        const hash = await bcrypt.hash(contraseña, 10)
        return prisma.usuario.create({
          data: { email, nombre, contraseña: hash, admin }
        })
      },

      // Comprueba las credenciales y devuelve el usuario si son correctas
      async autentifica(email: string, contraseña: string) {
        const usuario = await prisma.usuario.findUnique({ where: { email } })
        if (!usuario) throw new Error('Usuario no encontrado')

        const ok = await bcrypt.compare(contraseña, usuario.contraseña)
        if (!ok) throw new Error('Contraseña incorrecta')

        return usuario
      }

    }
  }
})

export default prisma