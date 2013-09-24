express = require "express"
cradle  = require "cradle"
path    = require "path"
fs 		= require "fs"
_ 		= require "underscore"

db = new(cradle.Connection)().database "files"


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
			
	# Сохраняем документ, соответствующий файлу
	db.save 
		mime : mimeType
	, (err, result) ->
		if err 
			do cleanup
			return next new Error "Error saving document #{err.error}"

		attachmentData = 
			name: file.originalFilename
			"Content-Type" : file.headers['content-type']

		# Сохраняем тело файла в базу, используя streaming
		writeStream = db.saveAttachment result.id, attachmentData, (err, result) ->
			if err
				do cleanup
				return next(err.error)

			res.json
				id : result.id

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

