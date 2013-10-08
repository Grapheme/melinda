express = require "express"
cradle  = require "cradle"
path    = require "path"
fs 		= require "fs"
_ 		= require "underscore"
crypto  = require "crypto"
moment  = require "moment"

db = new(cradle.Connection)().database "files"

uploadDir = path.resolve path.join __dirname, "../upload"

if not fs.existsSync uploadDir
	fs.mkdirSync uploadDir

# Функция вычисляет md5 хеш от файла
hashFile = (path, callback) ->
	file = fs.createReadStream path
	hash = crypto.createHash "md5"

	callbackOnce = _(callback).once()

	file.on "data", (data) ->
		hash.update data

	file.on "end", ->
		callbackOnce null, hash.digest "hex"

	file.on "error", (err) ->
		callbackOnce err


# Обработчик загрузки файлов
module.exports.upload = (req, res, next) ->

	# Готовим список загруженных файлов 
	# (их может быть больше одного!)
	files = _([ req.files.file ]).flatten()

	if files.length <= 0
		return next new Error "Invalid arguments!"

	# Берем только первый файл
	file = _(files).first()

	# Остальные файлы удаляем
	_(files).chain()
		.rest()
		.each (f) -> fs.unlink f.path


	hashFile file.path, (err, hash) ->
		if err 
			return next new Error "Error hashing file!"

		mimeType  = file.headers['content-type']
		filename  = "#{ hash }#{ path.extname(file.originalFilename) }"
		timestamp = moment().unix()

		fullpath  = path.join uploadDir, filename

		fs.rename file.path, fullpath, (err) ->
			if err
				return next new Error "Error saving file!"
			
			# Сохраняем документ, соответствующий файлу
			db.save hash,
				mime 	 : mimeType
				created  : timestamp
				filename : filename
			, (err, result) ->
				return res.json 
					_id : hash


# Обработчик получения файла по его id
module.exports.get = (req, res, next) ->
	id = req.params.id

	db.get id, (err, doc) ->
		if err
			return next new Error "Error getting file #{err.error}"

		fullpath  = path.join uploadDir, doc.filename
		res.sendfile fullpath

		# Обновляем время последнего доступа к файлу
		mergeFields = 
			accessed : moment().unix()
			hits 	 : (doc.hits ? 0) + 1

		db.merge id, mergeFields, (err, doc) ->

		

