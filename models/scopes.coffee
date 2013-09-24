cradle = require "cradle"
_      = require "underscore"

scopes = new(cradle.Connection)().database "scopes"

exports.create = (req, res, next) ->
    createdDoc = _(req.body).chain()
        .pick(["music", "image"])
        .defaults
            music : "default_music"
            image : "default_image"
        .value()

    scopes.save createdDoc, (err, doc) ->
        if err 
            return next new Error "Error saving document #{err.error}"
            
        res.json _(doc).pick([ "music", "image", "_id"])

exports.update = (req, res, next) ->
    id = req.params.id

    # Берем только поля, доступные для редактирования
    mergeFields = _(req.body).pick([ "music", "image"])

    scopes.merge id, mergeFields, (err, doc) ->
        if err 
            return next new Error "Error updating fields #{err.error}"

        res.json doc

exports.read = (req, res, next) ->
    id = req.params.id

    scopes.get id, (err, doc) ->
        if err 
            return next new Error "Error getting document #{err.error}"

        res.json _(doc).pick([ "music", "image", "_id" ])

exports.delete = (req, res, next) ->
    return next "Not yet implemented!"