import { hash, compare } from 'bcrypt';

export async function hashPassword(password: string) {
    const hashedPassword = await hash(password, 12);
    return hashedPassword;
}

export async function validatePassword(password: string) {
    return password && password.trim().length > 0;
}

export async function verifyPassword(password: string, hashedPassword: string) {
    const isValid = await compare(password, hashedPassword);
    return isValid;
}