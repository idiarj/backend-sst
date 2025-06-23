
import { iPgManager } from "../instances/iPgManager.js";
import CryptManager from "../services/bcrypt.js";

class User {
    static async createUser({name, last_name, email, id_cardNumber, phone_number}){
        try {
            // Simulacion de insertar usuario en la bd
            // if(await this.validateUsername({username})){
            //     throw new Error('El nombre de usuario ya existe');
            // }

            const [isValidEmail, isValidPhoneNumber] = await Promise.all([
                this.validateEmail({email}),
                this.validatePhoneNumber({phone_number})])

            if(isValidEmail){
                throw new Error('El email ya está registrado');
            }

            if(isValidPhoneNumber.success){
                throw new Error('El número de teléfono ya está registrado');
            }
    
            const key = 'createUser';
            const params = [name, last_name, email, id_cardNumber, phone_number];
            const result = await iPgManager.exeQuery({key, params});

            return {success: true, message: 'Usuario registrado exitosamente', result};

        } catch (error) {
            throw new Error(`Error al crear el usuario: ${error.message}`);
        }
    }

    static async registerUserPOST({id_cardNumber, email, password}){
        try {
            const key = 'registerUser';
            // Encriptar la contraseña
            const hashedPassword = await CryptManager.encriptarData({data: password, saltRounds: 10})
            const params = [id_cardNumber, email, hashedPassword];
            const registerResult = await iPgManager.exeQuery({key, params})
            return registerResult
        } catch (error) {
            throw new Error(`Error al registrar el usuario: ${error.message}`)
        }
    }

    static async validateUsername({username}){
        try {
            const key = 'selectUserByUsername';
            const params = [username];
            const result = await iPgManager.exeQuery({key, params});
            if (result.length > 0) {
                return {success: true, result}; // El nombre de usuario ya existe
            }
            return {success: false}; // El nombre de usuario no existe
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
                return {success: true, result: result[0]}; // El email ya existe
            }
            return false; // El email no existe
        } catch (error) {
            throw new Error(`Error al validar el email: ${error.message}`);
        }
    }

    static async validatePassword({email, password}){
        try {
            const key = 'validatePassword';
            const params = [email]
            const [{pwd_usuario}] = await iPgManager.exeQuery({key, params})
            
            const isValdPwd = await CryptManager.compareData({hashedData: pwd_usuario, toCompare: password})
            
            return {success: isValdPwd};
        } catch (error) {
            throw new Error(`Error al verificar la contraseña: ${error.message}`);
        }
    }

    static async validatePhoneNumber({phone_number}){
        try {
            const key = 'validatePhoneNumber';
            const params = [phone_number];
            const result = await iPgManager.exeQuery({key, params});
            if (result.length > 0) {
                return {success: true, result}; // El número de teléfono ya existe
            }
            return {success: false}; // El número de teléfono no existe
        } catch (error) {
            throw new Error(`Error al validar el número de teléfono: ${error.message}`);
        }
    }

    static async changePassword({newPassword}){
        try {
            const key = 'changePassword';
            const hashedNewPassword = await CryptManager.encriptarData({data: newPassword, saltRounds: 10});
            const params = [hashedNewPassword];
            const result = await iPgManager.exeQuery({key, params});
            return {success: true, message: 'Contraseña cambiada exitosamente', result};
        } catch (error) {
            throw new Error(`Error al cambiar la contraseña: ${error.message}`);
        }
    }
}

export default User;