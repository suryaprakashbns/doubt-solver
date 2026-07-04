import axios from 'axios'

const api = axios.create({
    baseURL:import.meta.env.PORT||'http://localhost:5000/api',
    headers:{
        'Content-Type' : 'application/json',
    },
    timeout : 10000,
})
api.interceptors.request.use(
    (config)=>{
        const token = localStorage.getItem('UserToken')
        if(token){
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) =>{
        return Promise.reject(error)
    }
)


api.interceptors.response.use(
    (response)=>{
        return response
    },
    (error)=>{
        if(error.response){
            if(error.response.status ===401){
                localStorage.removeItem('userToken')
                localStorage.removeItem('userData')
            if(!window.location.pathname.includes('/login')&&!window.location.pathname.includes('/register')){
                window.location.href = '/login'
            }    
            }
        }
        else if(error.request){
            console.error('Network error - is the backend running? ',error.request)
        }
        else{
            console.error('Request setup error: ',error.message)
        }
        return Promise.reject(error)
    }
)

export default api