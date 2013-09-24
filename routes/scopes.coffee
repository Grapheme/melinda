cradle = require "cradle"

scopes = new(cradle.Connection)().database "scopes"


exports.create = (req, res) ->
	throw "Not yet implemented!"

exports.update = (req, res) ->
	throw "Not yet implemented!"

exports.read = (req, res) ->
	id = req.params.id

	scopes.get id, (err, doc) ->
		res.json doc

exports.delete = (req, res) ->
	throw "Not yet implemented!"