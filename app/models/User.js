const db = require('../utils/db')
const { logger } = require('../utils/logger')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')

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

User.logout = async (id, refreshToken) => {
    try {
        const result = await db.query(
            `INSERT INTO blacklisted_tokens(token, user)
             VALUES (?, UUID_TO_BIN(?))`,
            [refreshToken, id]
        )

        return result.affectedRows !== 0
    } catch (err) {
        logger.error(err, 'Could not blacklist token')
        throw err
    }
}

User.isTokenBlacklisted = async (id, token) => {
    try {
        const result = await db.query(
            `SELECT *
             FROM blacklisted_tokens
             WHERE user = UUID_TO_BIN(?) AND token = ?`,
            [id, token]
        )
        return result.length > 0
    } catch (err) {
        logger.error(err, 'Could not check for blacklisted token')
        throw err
    }
}

User.removeExpiredTokensFromBlacklist = async () => {
    try {
        const tokens = await db.query(
            `SELECT token
             FROM blacklisted_tokens`
        )
        let toRemove = []
        tokens.forEach((token) => {
            try {
                if (jwt.verify(token, config.secrets.refresh)) {
                    return
                }
            } catch (err) {
                if (err.message === 'jwt expired') {
                    toRemove.push(token)
                }
            }
        })
        db.query(
            `DELETE FROM blacklisted_tokens
             WHERE token IN (?)`,
            [toRemove]
        )
    } catch (err) {
        logger.error(err, 'Could not remove expired tokens')
        throw err
    }
}

User.getList = async (userID, listName, limit = 50, offset = 0) => {
    try {
        if (!['backlog', 'watchlist', 'played'].includes(listName)) {
            const err = new Error()
            err.message(`List named \"${listName}\" does not exist`)
            throw err
        }
        const games = await db.query(
            `SELECT *
             FROM ${listName} 
             WHERE user = UUID_TO_BIN(?)
             LIMIT ? OFFSET ?`,
            [userID, limit, offset]
        )
        return listName !== 'played'
            ? games.map((value) => value.game)
            : games.map((value) => {
                  return { game: value.game, completed: value.completed }
              })
    } catch (err) {
        logger.error(err, 'Could not get list')
        throw err
    }
}

User.addToList = async (userID, listName, gameID) => {
    try {
        const lists = ['backlog', 'watchlist', 'played']
        if (!lists.includes(listName)) {
            const err = new Error()
            err.message(`List named \"${listName}\" does not exist`)
            throw err
        }
        lists.splice(lists.indexOf(listName), 1)
        await db.query(
            `DELETE FROM ${lists[0]}
             WHERE user = UUID_TO_BIN(?) AND game = ?`,
            [userID, gameID]
        )
        await db.query(
            `DELETE FROM ${lists[1]}
             WHERE user = UUID_TO_BIN(?) AND game = ?`,
            [userID, gameID]
        )
        const result = await db.query(
            `INSERT IGNORE INTO ${listName} (user, game)
             VALUES (UUID_TO_BIN(?), ?)`,
            [userID, gameID]
        )
        return result.affectedRows !== 0
    } catch (err) {
        logger.error(err, `Could not add to list ${listName}`)
        throw err
    }
}

User.removeFromList = async (userID, listName, gameID) => {
    try {
        const lists = ['backlog', 'watchlist', 'played']
        if (!lists.includes(listName)) {
            const err = new Error()
            err.message(`List named \"${listName}\" does not exist`)
            throw err
        }
        const result = await db.query(
            `DELETE FROM ${listName}
             WHERE user = UUID_TO_BIN(?) AND game = ?`,
            [userID, gameID]
        )
        return result.affectedRows !== 0
    } catch (err) {
        logger.error(err, `Could not remove from list ${listName}`)
        throw err
    }
}

User.setCompleted = async (userID, gameID, value) => {
    try {
        const result = await db.query(
            `UPDATE played
             SET completed = ?
             WHERE user = UUID_TO_BIN(?) AND game = ?`,
            [value, userID, gameID]
        )
    } catch (err) {
        logger.error(err, `Could not update completed status`)
        throw err
    }
}

module.exports = User
