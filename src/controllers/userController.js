import User from "../models/userModels.js";

class userController {
        static async createUserPOST(req, res){
        try {
            const {id_cardNumber, first_name, last_name, phone_number, id_departamento, es_tecnico} = req.body;

            const createUserResult = await User.createUser({
                name: first_name,
                last_name,
                id_cardNumber,
                phone_number,
                id_departamento,
                es_tecnico
            })

            if(!createUserResult.success){
                return res.status(createUserResult.status).json({
                    message: createUserResult.message,
                })
            }

            return res.status(createUserResult.status).json({
                ...createUserResult
            })

        } catch (error) {
            console.log('Error en createUserPOST: ', error);
            return res.status(500).json({
                error: 'Error al intentar crear el usuario',
                detalle: error.message
            })
        }
    }
}


export default userController;