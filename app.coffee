express     = require "express"
path        = require "path"
fs          = require "fs"
_           = require "underscore"
cradle      = require "cradle"

app = express()

# Настройки
app.set "port", process.env.PORT || 80
app.set "staticDir", path.join __dirname, "static"
app.set "uploadDir", path.join __dirname, "upload"

# Настройка middleware
app.use express.favicon()
app.use express.logger("dev")
app.use express.bodyParser()
app.use express.methodOverride()
app.use app.router
app.use express.static app.get "staticDir"
app.use express.errorHandler()

#  Обработчики ставим, соответствуя модели REST/CRUD
files = require "./models/files"
app.post    "/files",       files.upload
app.get     "/files/:id",   files.get

scopes = require "./models/scopes"
app.put     "/scopes",      scopes.create
app.get     "/scopes/:id",  scopes.read
app.post    "/scopes/:id",  scopes.update
app.delete  "/scopes/:id",  scopes.delete


app.get "/:id?", (req, res) ->
    res.sendfile path.join (app.get "staticDir"), "index.html" 

app.listen (app.get "port"), ->
    console.log "Server started at port #{ app.get('port') }"






        

