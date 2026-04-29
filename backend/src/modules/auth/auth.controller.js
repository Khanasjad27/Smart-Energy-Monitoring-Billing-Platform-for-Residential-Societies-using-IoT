// we had created controller inside auth.service.js but we will move it to auth.controller.js for better code organization and separation of concerns. So, we will create a new file called auth.controller.js and move the controller functions from auth.service.js to auth.controller.js. Then, we will import the controller functions in auth.route.js 
// therefore =>   Route -> auth.service.js -> Database (for now)

// And inside auth.service.js we already handle:

// req.body

// validation

// Prisma queries

// JWT token

// res.status().json()

// So practically, that file is acting as a controller + service combined.