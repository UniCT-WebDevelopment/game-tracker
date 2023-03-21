const db = require('../utils/db')
const { logger } = require('../utils/logger')
const bcrypt = require('bcryptjs')

const User = {}

User.getAll = async () => {
    try {
        let users = await db.query(
            `SELECT BIN_TO_UUID(id) as id, name, email, password, reset_password_token, email_verification_timestamp 
             FROM users`
        )
        return users
    } catch (err) {
        logger.error(err, 'Could not retrieve users from database')
        throw err
    }
}

User.create = async (name, email, password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 12)
        const insertedValue = await db.query(
            `INSERT INTO users(id, name, email, password) 
             VALUES(UUID_TO_BIN(UUID()), ?, ?, ?)`,
            [name, email, hashedPassword]
        )
        const newUser = await User.getByEmail(email)
        return newUser
    } catch (err) {
        logger.error(err, 'Could not add new user to database')
        throw err
    }
}

User.getByEmail = async (email) => {
    try {
        const user = await db.query(
            `SELECT BIN_TO_UUID(id) as id, name, email, password, reset_password_token, email_verification_timestamp 
             FROM users 
             WHERE email = ?`,
            [email]
        )
        return user[0]
    } catch (err) {
        logger.error(err, 'Could not retrieve user by email ' + email)
        throw err
    }
}

User.getByID = async (id) => {
    try {
        const user = await db.query(
            `SELECT BIN_TO_UUID(id) as id, name, email, password, reset_password_token, email_verification_timestamp 
             FROM users 
             WHERE id = UUID_TO_BIN(?)`,
            [id]
        )
        return user[0]
    } catch (err) {
        logger.error(err, 'Could not retrieve user by id ' + id)
        throw err
    }
}

User.verifyEmail = async (id) => {
    try {
        const result = await db.query(
            `UPDATE users 
             SET email_verification_timestamp = CURRENT_TIMESTAMP() 
             WHERE id = UUID_TO_BIN(?)`,
            [id]
        )
        return result.affectedRows !== 0
    } catch (err) {
        logger.error(err, 'Could not update verification timestamp')
        throw err
    }
}

User.updateResetToken = async (email, token) => {
    try {
        await db.query(
            `UPDATE users 
             SET reset_password_token = ? 
             WHERE email = ?`,
            [token, email]
        )
    } catch (err) {
        logger.error(err, 'Could not set reset token')
        throw err
    }
}

User.updatePassword = async (id, token, newPassword) => {
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        const result = await db.query(
            `UPDATE users 
             SET password = ?, reset_password_token = ? 
             WHERE id = UUID_TO_BIN(?) AND reset_password_token = ?`,
            [hashedPassword, null, id, token]
        )
        return result.affectedRows !== 0
    } catch (err) {
        logger.error(err, 'Could not update password')
        throw err
    }
}

module.exports = User
