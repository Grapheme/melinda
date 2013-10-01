express = require "express"
cradle  = require "cradle"
path    = require "path"
fs 		= require "fs"
_ 		= require "underscore"
crypto  = require "crypto"
moment  = require "moment"

db = new(cradle.Connection)().database "files"

hashFile = (path, callback) ->
	file = fs.createReadStream path
	hash = crypto.createHash "md5"

	file.on "data", (data) ->
		hash.update data

	file.once "end", ->
		callback null, hash.digest "hex"

	file.once "error", (err) ->
		callback err



# Обработчик загрузки файлов
module.exports.upload = (req, res, next) ->

	# Готовим список загруженных файлов 
	# (их может быть больше одного!)
	files = _([ req.files.file ]).flatten()

	if files.length <= 0
		return next new Error "Invalid arguments!"

	# Функция, удаляющая временные файлы
	cleanup = ->
		_(files).each (f) ->
			fs.unlink f.path

	# Берем только первый файл
	file = files[0]

	mimeType = file.headers['content-type']

	hashFile file.path, (err, hash) ->
		if err 
			do cleanup
			return next new Error "Error hashing file!"

		timestamp = moment().unix()
			
		# Сохраняем документ, соответствующий файлу
		db.save hash,
			mime 	 : mimeType
			created  : timestamp
			accessed : timestamp 
		, (err, result) ->
			if err 
				do cleanup
				return res.json 
					_id : hash

			attachmentData = 
				name: file.originalFilename
				"Content-Type" : file.headers['content-type']

			# Сохраняем тело файла в базу, используя streaming
			writeStream = db.saveAttachment result.id, attachmentData, (err, att) ->
				if err
					do cleanup
					return next(err.error)

				return res.json 
					_id : hash

			readStream = fs.createReadStream file.path
			readStream.pipe writeStream


# Обработчик получения файла по его id
module.exports.get = (req, res, next) ->
	id = req.params.id

	db.get id, (err, doc) ->
		if err
			return next new Error "Error getting file #{err.error}"

		attachmentName = _(doc._attachments).keys()[0]

		readStream = db.getAttachment id, attachmentName, (err) ->

		res.set "Content-Type", doc.mime
		readStream.pipe res

