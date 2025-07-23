




class DepartamentModel {
    static async getDepartamentsByHeadquarter({headquarter_id}) {
        try {
            const key = 'getDepartamentsByHeadquarter';
            const params = [headquarter_id];
            const result = await iPgManager.exeQuery({ key, params });
            if (result.length === 0) {
                return { success: false, message: 'No se encontraron departamentos para esta sede.' };
            }

            return { success: true, data: result, message: 'Departamentos obtenidos exitosamente.' };
        } catch (error) {
         throw new Error(`Error al obtener los departamentos: ${error.message}`);   
        }
    }

    static async createDepartament({ name, headquarter_id }) {
        try {
            const key = 'createDepartament';
            const params = [name, headquarter_id];
            const result = await iPgManager.exeQuery({ key, params });
            return {
                success: true,
                message: 'Departamento creado exitosamente.',
                data: result
            };
        } catch (error) {
            throw new Error(`Error al crear el departamento: ${error.message}`);
        }
    }

    static async updateDepartament({ id, name, headquarter_id }) {
        try {
            const key = 'updateDepartament';
            const params = [id, name, headquarter_id];
            const result = await iPgManager.exeQuery({ key, params });

            return { success: true, message: 'Departamento actualizado exitosamente.', data: result };
        } catch (error) {
            throw new Error(`Error al actualizar el departamento: ${error.message}`);
        }
    }

    static async deleteDepartmanet({id}){
        try {
            const key = 'deleteDepartament';
            const params = [id];
            const result = await iPgManager.exeQuery({ key, params });

            return { success: true, message: 'Departamento eliminado exitosamente.' };
        } catch (error) {
            throw new Error(`Error al eliminar el departamento: ${error.message}`);
        }
    }
}