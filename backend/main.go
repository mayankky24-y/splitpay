package main

import (
	"github.com/JZ23-2/splitbill-backend/config"
	"github.com/JZ23-2/splitbill-backend/database"
	_ "github.com/JZ23-2/splitbill-backend/docs"
	"github.com/JZ23-2/splitbill-backend/routes"
)

//	@Split				Pay
//	@version			1.0
//	@Split				Pay Backend
//	@contact.Jackson	API Support
//	@contact.email		Jacksontpa7@gmail.com
//	@license.name		MIT
//	@BasePath			/api/v1
func main() {
	config.Loadenv()
	database.ConnectDB()
	routes.SetUpRoutes()
}
