import jwt from 'jsonwebtoken';


class sessionManager{
    constructor(){

    }
    
    static createSession({payload, access_token_key, refresh_token_key}){
        try {
            const access_token = jwt.sign(payload, access_token_key, {expiresIn: '5min'})
            //const refresh_token = jwt.sign(payload, refresh_token_key, {expiresIn:  '3h'})
            console.log(`Access token: ${access_token}`);
            // console.log(`Refresh token: ${refresh_token}`);
            return {access_token}
        } catch (error) {
            console.log(`Error: ${error}`);
            throw error;
        }
    }

    // refreshAccessToken({payload, access_token_key}){
    //     try {
    //         const newAT = jwt.sign(payload, access_token_key, {expiresIn: '5min'})
    //         return newAT;
    //     } catch (error) {
    //         console.log(`Erorr: ${error}`);
    //         throw error;
    //     }
    // }

    static verifyToken({token, key}){
        try {
            const decoded = jwt.verify(token, key);
            return decoded;
        } catch (error) {
            console.log(`Error: ${error}`);
            throw error;
        }
    }   
}

export default sessionManager