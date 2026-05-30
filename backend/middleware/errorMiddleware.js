const notFound = (req,res,next) => {
    const error = new Error(`Route not found: ${req.orginalUrl}`)

res.status(404) 
next(error)
}

const errorHandler = (err,req,res,next) =>{
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
    res.status(statusCode)
    res.json({
        message: err.message,
        stack : process.env.NODE_ENV ==='production'?'Not Available for Production':err.stack
    })
}

export { notFound , errorHandler }