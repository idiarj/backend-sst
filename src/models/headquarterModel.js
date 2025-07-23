



class headquarterModel {
    static async getAllHeadquarters() {
        try {
            const key = 'getAllHeadquarters';
            const result = await iPgManager.exeQuery({ key });
            if (result.length === 0) {
                return { success: false, message: 'No se encontraron sedes.' };
            }
            return { success: true, data: result, message: 'Sedes obtenidas exitosamente.' }; 
        } catch (error) {
            throw new Error(`Error al obtener las sedes: ${error.message}`);
        }
    }

    static async createHeadquarter({ name, address, phone, state }) {
        try {
            const key = 'createHeadquarter';
            const params = [name, address, phone, state];
            const result = await iPgManager.exeQuery({ key, params });
            return {
                success: true,
                message: 'Sede creada exitosamente.',
                data: result
            };
        } catch (error) {
            throw new Error(`Error al crear la sede: ${error.message}`);
        }
    }

    static async updateHeadquarter({ id, name, address, phone, state }) {
        try {
            const key = 'updateHeadquarter';
            const params = [id, name, address, phone, state];
            const result = await iPgManager.exeQuery({ key, params });
            // if (result.rowCount === 0) {
            //     return { success: false, message: 'No se encontró la sede a actualizar.' };
            // }
            return { success: true, message: 'Sede actualizada exitosamente.', data: result };
        } catch (error) {
            throw new Error(`Error al actualizar la sede: ${error.message}`);
        }
    }

    static async deleteHeadquarter({ id }) {
        try {
            const key = 'deleteHeadquarter';
            const params = [id];
            const result = await iPgManager.exeQuery({ key, params });

            return { success: true, message: 'Sede eliminada exitosamente.' };
        } catch (error) {
            throw new Error(`Error al eliminar la sede: ${error.message}`);
        }
    }
}