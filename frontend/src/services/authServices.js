import api from './api'

const authService = {
    register:async (userData) =>{
        const response = await api.post('/auth/register',userData)
        return response.data
    },
    login:async(Credential) =>{
        const response = await api.post('/auth/login',Credential)
        return response.data
    },
    getMe:async ()=>{
        const response = await api.get('/auth/me')
        return response.data
    },
}

export default authService