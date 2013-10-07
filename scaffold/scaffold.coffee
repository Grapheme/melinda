cradle      = require "cradle"
moment  	= require "moment"
path 		= require "path"
fs 			= require "fs"

couch = new(cradle.Connection)()

scopes = couch.database "scopes"
files  = couch.database "files"

IMAGE_FILE = path.join __dirname, "default.jpg"
AUDIO_FILE = path.join __dirname, "default.mp3"

uploadDir = path.resolve path.join __dirname, "../upload"

if not fs.existsSync uploadDir
	fs.mkdirSync uploadDir

copyFile = (src, dest) ->
	fs.createReadStream( src ).pipe(fs.createWriteStream( dest ))

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

	filename = path.basename filePath

	db.save name,
		mime     : mime
		created  : timestamp 
		filename : filename
	, (err, result) ->
		callback null


emptyBase files, (err) ->
	putFile files, IMAGE_FILE, "image/jpg", "defaultimage", (err) ->
		console.log "Default image created"

	putFile files, AUDIO_FILE, "audio/mp3", "defaultaudio", (err) ->
		console.log "Default audio created"

copyFile IMAGE_FILE, path.join uploadDir, path.basename IMAGE_FILE
copyFile AUDIO_FILE, path.join uploadDir, path.basename AUDIO_FILE






 
