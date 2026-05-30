import mongoose from 'mongoose'





const connectDB = async ()=>{
   
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI)
            mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected')
    })

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected')
    })

    // In production, log errors but don't crash —
    // Mongoose will attempt to reconnect automatically
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB error: ${err.message}`)
    })
    } 
    catch(error){
          console.log(`connection failed ${error.message}`)
          process.exit(1)
    }
}
export default connectDB