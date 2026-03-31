import { z } from 'zod';

// Producto API
export const CreateProductSchema = z.object({
  título: z.string().min(1, 'Título requerido'),
  descripción: z.string().min(5, 'Mínimo 5 caracteres'),
  precio: z.coerce.number().positive('Precio debe ser positivo'),
  imagen: z.string().optional().default(''),
});

export const UpdateProductSchema = CreateProductSchema.partial();

// Usuario
export const RegisterUserSchema = z.object({
  email: z.string().email('Email inválido'),
  nombre: z.string().min(2, 'Nombre muy corto'),
  contraseña: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const LoginUserSchema = z.object({
  email: z.string().email('Email inválido'),
  contraseña: z.string().min(1, 'Contraseña requerida'),
});

// Tipos inferidos
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;
export type LoginUserInput = z.infer<typeof LoginUserSchema>;
