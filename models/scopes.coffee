cradle  = require "cradle"
_       = require "underscore"
hashids = require "hashids"
moment  = require "moment"

scopes = new(cradle.Connection)().database "scopes"

# Функция генерирует произвольный короткий адрес вида "pgVQVn"
# Выполняется наивная и глупая проверка на уникальность
generateId = (callback) ->
    hasher = new hashids "salt"
    num = _.random(0, 0xffffffff)
    id = hasher.encrypt(num)

    # Пытаемся выяснить, есть ли конфликт
    scopes.get id, (err, doc) ->
        if err
            return callback id

        generateId callback


exports.create = (req, res, next) ->
    createdDoc = _(req.body).chain()
        .pick(["audio", "image"])
        .defaults
            audio : "defaultaudio"
            image : "defaultimage"
        .value()

    generateId (id) ->
        scopes.save id, createdDoc, (err, doc) ->
            if err 
                return next new Error "Error saving document #{err.error}"
                
            res.json _(doc).pick([ "audio", "image", "_id"])

exports.update = (req, res, next) ->
    id = req.params.id

    # Берем только поля, доступные для редактирования
    mergeFields = _(req.body).pick([ "audio", "image"])

    scopes.merge id, mergeFields, (err, doc) ->
        if err 
            return next new Error "Error updating fields #{err.error}"

        res.json doc

exports.read = (req, res, next) ->
    id = req.params.id

    scopes.get id, (err, doc) ->
        if err 
            return next new Error "Error getting document #{err.error}"

        # Обновляем статистику
        mergeFields = 
            accessed : moment().unix()
            hits     : 1 + doc.hits?

        scopes.merge id, mergeFields, (err, doc) ->

        res.json _(doc).pick([ "audio", "image", "_id" ])

exports.delete = (req, res, next) ->
    return next "Not yet implemented!"
    