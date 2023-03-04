import { hash, genSalt, compare } from 'bcrypt';
var crypto = require('crypto');
var base64url = require('base64url');

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
    return password && password.trim().length > 8;
}

export async function verifyPassword(saltedPassword: string, hashedPassword: string) {
    const isValid = await compare(saltedPassword, hashedPassword);
    return isValid;
}

export function generateToken() {
    return base64url(crypto.randomBytes(32));
}