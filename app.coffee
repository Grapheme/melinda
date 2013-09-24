express 	= require "express"
consolidate = require "consolidate"
path 		= require "path"
fs 			= require "fs"
_ 			= require "underscore"
cradle  	= require "cradle"

app = express()

# Настройки
app.set "port", process.env.PORT || 3000
app.set "public", path.join __dirname, "public"

# Настройка движка шаблонизатора
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


#  Обработчики ставим, соответствуя модели REST/CRUD
files = require "./models/files"
app.post 	"/files", 		files.upload
app.get  	"/files/:id", 	files.get

scopes = require "./models/scopes"
app.put  	"/scopes", 	 	scopes.create
app.get  	"/scopes/:id", 	scopes.read
app.post 	"/scopes/:id",	scopes.update
app.delete 	"/scopes/:id", 	scopes.delete


# Настройка роутинга
app.get "/:id?", (req, res) ->
	res.sendfile path.join (app.get "public"), "index.html" 


app.listen (app.get "port"), ->
	console.log "Server started at port #{ app.get('port') }"






		

