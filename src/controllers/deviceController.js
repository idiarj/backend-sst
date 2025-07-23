




class DeviceController {
    static async devicePOST(){
        try {
            /// Simulacion de crear un equipo
        } catch (error) {
            res.status(500).json({
                error: 'Error al registrar el dispositivo, por favor intente mas tarde',
                detalle: error.message
            });
        }
    }

    static async deviceGET(req, res){
        try {
            // Simulacion de obtener un equipo
            const deviceId = req.params.id;
            // Aqui iria la logica para obtener el dispositivo por su ID
            res.status(200).json({
                mensaje: `Dispositivo con ID ${deviceId} obtenido exitosamente`
            });
        } catch (error) {
            res.status(500).json({
                error: 'Error al obtener el dispositivo, por favor intente mas tarde',
                detalle: error.message
            });
        }
    }

    static async getDevicesByOffice(req, res){
        try {
            // Simulacion de obtener equipos por oficina
            const officeId = req.params.officeId;
            // Aqui iria la logica para obtener los dispositivos por su ID de oficina
            res.status(200).json({
                mensaje: `Dispositivos de la oficina con ID ${officeId} obtenidos exitosamente`
            });
        } catch (error) {
            res.status(500).json({
                error: 'Error al obtener los dispositivos de la oficina, por favor intente mas tarde',
                detalle: error.message
            });
        }
    }

    
}