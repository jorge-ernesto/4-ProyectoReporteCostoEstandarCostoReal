// Notas del archivo:
// - Secuencia de comando:
//      - Biomont UE Desglose Costo Estandar (customscript_bio_ue_des_costo_estandar)
// - Registro:
//      - Desglose Costo Estandar (customrecord_des_costo_estandar)

// Notas:
// - Este UserEventScript no esta desplegado, al final no se uso

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N'],

    function (N) {

        const { log, search } = N;

        /******************/

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        function beforeSubmit(context) {
            log.debug('Punto de Entrada', 'beforeSubmit');
            log.debug('context', context);
            log.debug('context.UserEventType', context.UserEventType);
            log.debug('search.Type', search.Type);

            if (context.type === context.UserEventType.EDIT || context.type === context.UserEventType.CREATE) {
                // Hacer algo
                log.debug('', 'Entro al modo Crear o Editar')

                // Nuevo registro
                    var articulo = context.newRecord
                    var id = articulo.getValue('id');
                    var item_id = articulo.getValue('custrecord_des_cost_est_art');
                    var check = articulo.getValue('custrecord_des_cost_est_pred');

                    var data = {
                        'id': id,
                        'item_id': item_id,
                        'check': check,
                    }
                    log.debug('articulo', data)

                // Buscar registro
                    // Solo busca el registro si el check "Predeterminado" esta seleccionado
                    if (data.check == true) {
                        // Crea una búsqueda de registros utilizando el objeto 'N/search'
                        var searchObj = search.create({
                            type: 'customrecord_des_costo_estandar',
                            columns: [],
                            filters: [
                                ['custrecord_des_cost_est_pred', 'is', true],
                                'AND',
                                ['custrecord_des_cost_est_art', 'is', data.item_id],
                                'AND',
                                ['internalid', 'noneof', data.id]
                            ]
                        });
                        log.debug('searchObj', searchObj)

                        codigoExistente = false;

                        // Ejecuta la búsqueda y verifica si se encontraron registros
                        searchObj.run().each((result) => {
                            // Verificar result
                            log.debug('result', result)

                            // Si se encuentra al menos un registro, establece 'codigoExistente' en verdadero y detén la búsqueda
                            codigoExistente = true;

                            // Detiene la búsqueda
                            return false;
                        });

                        // Verifica si el código ya existe
                        if (codigoExistente) {
                            throw new Error('Ya existe un registro predeterminado para el articulo.');
                        }
                    }

                // throw new Error('Detener submit.');
            }
        }

        return { beforeSubmit };

    });
