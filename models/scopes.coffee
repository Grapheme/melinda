cradle = require "cradle"
_	   = require "underscore"


scopes = new(cradle.Connection)().database "scopes"

exports.create = (req, res) ->
	createdDoc = 
		music : "default_music"
		image : "default_image"

	# TODO: merge with passed parameters
	scopes.save createdDoc, (err, doc) ->
		if err 
			throw err
			
		res.json _(doc).pick([ "music", "image", "_id"])

exports.update = (req, res) ->
	id = req.params.id

	# Берем только поля, доступные для редактирования
	mergeFields = _(req.body).pick([ "music", "image"])

	scopes.merge id, mergeFields, (err, doc) ->
		if err
			throw err

		res.json doc

exports.read = (req, res) ->
	id = req.params.id

	scopes.get id, (err, doc) ->
		throw err if err

		res.json _(doc).pick([ "music", "image", "_id" ])

exports.delete = (req, res) ->
	throw "Not yet implemented!"