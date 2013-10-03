cradle      = require "cradle"
moment  	= require "moment"
path 		= require "path"
fs 			= require "fs"

couch = new(cradle.Connection)()

scopes = couch.database "scopes"
files  = couch.database "files"


emptyBase = (db, callback) ->
	db.exists (err, exists) ->
		if err
			throw new Error "DB access error #{err}"

		if exists
			db.destroy (err) ->
				db.create callback
		else
			db.create callback
			
emptyBase scopes, (err) ->
	scopes.save "default", 
		image : "defaultimage"
		audio : "defaultaudio"
	, (err, res) ->
		console.log "Default scope created"

putFile = (db, filePath, mime, name, callback) ->
	timestamp = moment().unix()

	db.save name,
		mime     : mime
		created  : timestamp 
	, (err, result) ->

		attachmentData = 
			name			: path.basename filePath
			"Content-Type" 	: mime

		# Сохраняем тело файла в базу, используя streaming
		writeStream = db.saveAttachment result.id, attachmentData, (err, att) ->
			if err
				return callback err

			callback null

		readStream = fs.createReadStream filePath
		readStream.pipe writeStream


emptyBase files, (err) ->
	putFile files, "db/defaultimage.jpg", "image/jpg", "defaultimage", (err) ->
		console.log "Default image created"

	putFile files, "db/defaultaudio.mp3", "audio/mp3", "defaultaudio", (err) ->
		console.log "Default audio created"





 
