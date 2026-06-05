import 'express-session'

declare module 'express-session' {
    interface SessionData {
        carrito: { id: number; cantidad: number }[]
        total_carrito: number
    }
}

declare global {
    namespace Express {
        interface Locals {
            usuario?: string
            admin?: boolean
        }
    }
}