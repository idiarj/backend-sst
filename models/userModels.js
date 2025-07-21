
import { iPgManager } from "../instances/iPgManager.js";
import CryptManager from "../services/bcrypt.js";
import jwtComponent from "../services/jwtComponent.js";

class User {
    static async createUser({name, last_name, id_cardNumber, phone_number}){
        try {
            // Simulacion de insertar usuario en la bd
            // if(await this.validateUsername({username})){
            //     throw new Error('El nombre de usuario ya existe');
            // }

            const [isValidIdCardNumber, isValidPhoneNumber] = await Promise.all([this.validatePhoneNumber({phone_number}), 
                this.validateIdCardNumber({id_cardNumber})]);  

            if(isValidIdCardNumber.exists){
                return {
                    success: false,
                    message: 'La cédula ya está asociada a un usuario.',
                    status: 409
                }
            }
            
            if(isValidPhoneNumber.success){
                return {
                    success: false,
                    message: 'El número de teléfono ya está asociado a un usuario.',
                    status: 409
                }
            }

            let registerFlag = false;
    
            const key = 'createUser';
            const params = [id_cardNumber, name, last_name, phone_number, 1, null];
            await iPgManager.exeQuery({key, params});

           

            return {
                success: true,
                message: `Usuario ${name} ${last_name} con C.I: ${id_cardNumber} creado con exito.`,
                status: 201
            }

        } catch (error) {
            console.error('Error en createUser Model:', error)
            throw new Error(`Error al crear el usuario.`);
        }
    }
    
    static async registerUserPOST({id_cardNumber, email, password}){
        const client = await iPgManager.beginTransaction();
        try {


            // Encriptar la contraseña
            const hashedPassword = await CryptManager.encriptarData({data: password, saltRounds: 10})
            const isValdEmail = await this.validateEmail({email});
            if(isValdEmail.exists){
                return {
                    success: false,
                    status: 400,
                    message: 'El correo ya esta asociado a un usuario.'
                }
            }

            // Preparar y ejecutar la consulta
            const key1 = 'registerUser';
            const params1 = [id_cardNumber, hashedPassword, true, email];
            await iPgManager.exeQuery({key: key1, params: params1, client})
            //console.log('ID del usuario registrado:', id_usuario);
            await iPgManager.commitTransaction(client);
            return {
                success: true,
                status: 200,
                message: `Registo del poseedor de la cedula ${id_cardNumber} exitoso.`
            }
        } catch (error) {
            await iPgManager.rollbackTransaction(client)
            console.error('Error en registrar usuario model:', error)
            throw new Error(`Error al registrar el usuario.`)
        }
    }

    static async validateIdCardNumber({id_cardNumber}){
        try {
            const key = 'validateIdCardNumber';
            const params = [id_cardNumber];
            const result = await iPgManager.exeQuery({key, params});
            if (result.length > 0) {
                return {exists: true, result}; // La cédula ya existe
            }
            return {exists: false}; // La cédula no existe
        } catch (error) {
            console.error('Error en validateIdCardNumber model:', error)
            throw new Error('Error al validar la cedula del usuario.')
        }
    }

    static async getUser({id_cardNumber}){
        try {
            const key = 'getUsername';
            
        } catch (error) {
            console.error('Error en getUser model:', error)
            throw new Error(`Error al obtener la informacion del usuario: ${error.message}`);
        }
    }

    static async validateEmail({email}){
        try {
            const key = 'selectUserByEmail';
            const params = [email];
            const result = await iPgManager.exeQuery({key, params});
            if (result.length > 0) {
                return {exists: true, result: result[0]}; // El email ya existe
            }
            return {exists: false}; // El email no existe
        } catch (error) {
            console.error('Error en validateEmail model:', error)
            throw new Error(`Error al validar el email: ${error.message}`);
        }
    }

    static async validatePassword({id_cardNumber, password}){
        try {
            const key = 'validatePassword';
            const params = [id_cardNumber]
            console.log('Contraseña del usuario:', password);
            const [{pwd_usuario}] = await iPgManager.exeQuery({key, params})
            console.log('Contraseña obtenida de la base de datos:', pwd_usuario);
            
            const isValdPwd = await CryptManager.compareData({hashedData: pwd_usuario, toCompare: password})
            
            return {success: isValdPwd};
        } catch (error) {
            console.error('Error en validatePassword model:', error)
            throw new Error(`Error al verificar la contraseña: ${error.message}`);
        }
    }

    static async validatePhoneNumber({phone_number}){
        try {
            const key = 'validatePhoneNumber';
            const params = [phone_number];
            const result = await iPgManager.exeQuery({key, params});
            if (result.length > 0) {
                return {exists: true, result}; // El número de teléfono ya existe
            }
            return {exists: false}; // El número de teléfono no existe
        } catch (error) {
            console.error('Error en validatePhoneNumber model:', error)
            throw new Error(`Error al validar el número de teléfono: ${error.message}`);
        }
    }

    static async changePassword({newPassword, email}){
        try {
            const key = 'updateUserPassword';
            const hashedNewPassword = await CryptManager.encriptarData({data: newPassword, saltRounds: 10});
            const params = [hashedNewPassword, email];
            const result = await iPgManager.exeQuery({key, params});
            return {success: true, message: 'Contraseña cambiada exitosamente', result};
        } catch (error) {
            console.error('Error en changePassword model:', error)
            throw new Error(`Error al cambiar la contraseña: ${error.message}`);
        }
    }
}

export default User;