import { hash, genSalt, compare } from 'bcrypt';

export async function hashAndSaltPassword(password: string) {
    const saltRounds = 10;
    
    const salt = await genSalt(saltRounds);
    const hashedSaltedPassword = await hash(password.concat(salt), 12);

    return { 
        salt: salt,
        hashedSaltedPassword: hashedSaltedPassword,
    }
}

export async function validatePassword(password: string) {
    return password && password.trim().length > 0;
}

export async function verifyPassword(saltedPassword: string, hashedPassword: string) {
    const isValid = await compare(saltedPassword, hashedPassword);
    return isValid;
}