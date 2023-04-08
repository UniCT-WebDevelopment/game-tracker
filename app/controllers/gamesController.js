const Game = require('../models/Game')
const User = require('../models/User')

exports.getSearch = async (req, res, next) => {
    try {
        const { query, limit, offset } = req.query
        const searchResults = await Game.search(query, limit, offset)
        res.status(200).json(searchResults)
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
        return err
    }
}

exports.getPopular = async (req, res, next) => {
    try {
        const { limit, offset } = req.query
        const results = await Game.getPopular(limit, offset)
        res.status(200).json(results)
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
        return err
    }
}

exports.getGameDetails = async (req, res, next) => {
    try {
        const { gameID } = req.params
        const result = await Game.getDetails(gameID)
        res.status(200).json(result)
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
        return err
    }
}

exports.getCategories = async (req, res, next) => {
    try {
        const { limit, offset, games } = req.query
        let result
        // games is the maximum number of games per genre that the client wants
        if (games) {
            results = await Game.getGenres(limit, offset, games)
        } else {
            results = await Game.getGenres(limit, offset)
        }
        res.status(200).json(results)
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
        return err
    }
}

exports.getSingleCategory = async (req, res, next) => {
    try {
        const { id } = req.params
        const { limit, offset } = req.query
        const results = await Game.getGamesByGenre(id, limit, offset)
        res.status(200).json(results)
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
        return err
    }
}

exports.getGamesList = async (req, res, next) => {
    try {
        const { userId, listName } = req.params
        const { limit, offset } = req.query
        const gameIDs = await User.getList(userId, listName, limit, offset)
        console.log(gameIDs)
        if (gameIDs?.length === 0) {
            res.status(200).json([])
        } else {
            // pagination is already done at the db level
            const games = await Game.getListByID(gameIDs, 500, 0)
            res.status(200).json(games)
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
        return err
    }
}

exports.putGameList = async (req, res, next) => {
    try {
        const { userId, listName, gameId } = req.params
        await User.addToList(userId, listName, Number(gameId))
        res.status(200).end()
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
        return err
    }
}

exports.deleteGameList = async (req, res, next) => {
    try {
        const { userId, listName, gameId } = req.params
        await User.removeFromList(userId, listName, Number(gameId))
        res.status(200).end()
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
        return err
    }
}
