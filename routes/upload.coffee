express = require "express"
cradle  = require "cradle"
path    = require "path"
fs 		= require "fs"
_ 		= require "underscore"

db = new(cradle.Connection)().database "files"

module.exports.upload = (req, res) ->
	files = _([ req.files.file ]).flatten()

	if files.length <= 0
		throw new Error "Invalid arguments!"

	cleanup = ->
		_(files).each (f) ->
			fs.unlink f.path

	file = files[0]

	mimeType = file.headers['content-type']
			
	db.save 
		mime : mimeType
	, (err, result) ->
		if err 
			do cleanup
			throw err

		attachmentData = 
			name: file.originalFilename
			"Content-Type" : file.headers['content-type']

		writeStream = db.saveAttachment result.id, attachmentData, (err, result) ->
			if err
				do cleanup
				throw err

			res.json
				id : result.id

		readStream = fs.createReadStream file.path
		readStream.pipe writeStream


module.exports.download = (req, res) ->
	id = req.params.id

	db.get id, (err, doc) ->
		if err
			throw err

		attachmentName = _(doc._attachments).keys()[0]

		readStream = db.getAttachment id, attachmentName, (err) ->

		res.set "Content-Type", doc.mime
		readStream.pipe res

