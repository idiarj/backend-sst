
import { iPgManager } from "../instances/iPgManager.js";
import CryptManager from "../services/bcrypt.js";

class User {
    static async createUser({username, pwd, email}){
        try {
            // Simulacion de insertar usuario en la bd
            if(await this.validateUsername({username})){
                throw new Error('El nombre de usuario ya existe');
            }

            if(await this.validateEmail({email})){
                throw new Error('El email ya está registrado');
            }
            const hashedPWd = await CryptManager.encriptarData({data: pwd, saltRounds: 10});
            console.log('Contrasena encriptada:', hashedPWd);
            const key = 'registerUser';
            const params = [username, email, hashedPWd];
            const result = await iPgManager.exeQuery({key, params});
            console.log(result)
            return result;

        } catch (error) {
            throw new Error(`Error al registrar el usuario: ${error.message}`);
        }
    }

    static async validateUsername({username}){
        try {
            const key = 'selectUserByUsername';
            const params = [username];
            const result = await iPgManager.exeQuery({key, params});
            if (result.length > 0) {
                return true; // El nombre de usuario ya existe
            }
            return false; // El nombre de usuario no existe
        } catch (error) {
            throw new Error(`Error al validar el nombre de usuario: ${error.message}`);
        }
    }

    static async validateEmail({email}){
        try {
            const key = 'selectUserByEmail';
            const params = [email];
            const result = await iPgManager.exeQuery({key, params});
            if (result.length > 0) {
                return true; // El email ya existe
            }
            return false; // El email no existe
        } catch (error) {
            throw new Error(`Error al validar el email: ${error.message}`);
        }
    }

    static async validatePassword({usuario, password}){
        try {
            const key = 'validatePassword';
            const params = [usuario]
            const [{pwd_usuario}] = await iPgManager.exeQuery({key, params})
            console.log(pwd_usuario)
            const isValdPwd = await CryptManager.compareData({hashedData: pwd_usuario, toCompare: password})
            console.log(isValdPwd)
            return isValdPwd;
        } catch (error) {
            throw new Error(`Error al verificar la contraseña: ${error.message}`);
        }
    }
}

export default User;