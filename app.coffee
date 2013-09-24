express 	= require "express"
consolidate = require "consolidate"
path 		= require "path"
fs 			= require "fs"
_ 			= require "underscore"
uuid 		= require "node-uuid"
cradle  	= require "cradle"

app = express()

# Настройки
app.set "port", process.env.PORT || 3000
app.set "public", path.join __dirname, "public"


# Настройки шаблонизатора
app.engine "html", consolidate.swig
app.set "view engine", "html"
app.set "views", app.get "public"

# Настройка middleware
app.use express.favicon()
app.use express.logger("dev")
app.use express.bodyParser()
app.use express.methodOverride()
app.use app.router
app.use express.static app.get "public"
app.use express.errorHandler()

## Роутинг!
app.get "/:id?", (req, res) ->
	res.render "index", {}


scopes = new(cradle.Connection)().database "scopes"

app.get "/scopes/:id?", (req, res) ->
	id = req.params.id

	scopes.get id, (err, doc) ->
		res.json doc

upload = require "./routes/upload"
app.post "/upload", 	upload.upload
app.get  "/upload/:id", upload.download

app.listen app.get "port"






		

