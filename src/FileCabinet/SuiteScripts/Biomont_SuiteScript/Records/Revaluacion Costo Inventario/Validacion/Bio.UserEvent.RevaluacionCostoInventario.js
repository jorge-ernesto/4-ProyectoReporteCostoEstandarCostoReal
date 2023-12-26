// Notas del archivo:
// - Secuencia de comando:
//      - Biomont UE Revaluacion Costo Inv (customscript_bio_ue_rev_cos_inv)
// - Registro:
//      - Revaluación de costos de inventario (inventorycostrevaluation)

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N'],

    function (N) {

        function error_log(title, data) {
            throw `${title} -- ${JSON.stringify(data)}`;
        }

        function mostrarError(data) {
            throw new Error(`${data}`);
        }

        /******************/

        function esDiferente(numero1, numero2, tolerancia = 0.01) {
            if (Math.abs(numero1 - numero2) < tolerancia) { // Los numeros son aproximadamente iguales.
                return false;
            } else { // Los números no son aproximadamente iguales.
                return true;
            }
        }

        /******************/

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {

            if (scriptContext.type == 'create' || scriptContext.type == 'edit') {

                // Proyecto: Reporte de costo estandar por elementos del costo
                // Validar que la suma de los elementos del 'Desglose Costo Estandar' debe sumar el 'Costo Estandar Total'
                let recordContext = scriptContext.newRecord;
                let costo_md = parseFloat(recordContext.getValue('custbody_bio_cam_cos_md'));
                let costo_mod = parseFloat(recordContext.getValue('custbody_bio_cam_cos_mod'));
                let costo_srv = parseFloat(recordContext.getValue('custbody_bio_cam_cos_srv'));
                let costo_cif = parseFloat(recordContext.getValue('custbody_bio_cam_cos_cif'));
                let unitcost = parseFloat(recordContext.getValue('unitcost'));
                let total_costos = parseFloat(costo_md) + parseFloat(costo_mod) + parseFloat(costo_srv) + parseFloat(costo_cif);

                // Verificar data
                // let data = {
                //     costo_md: costo_md,
                //     costo_mod: costo_mod,
                //     costo_srv: costo_srv,
                //     costo_cif: costo_cif,
                //     unitcosto: unitcost,
                //     total_costos,
                //     compararNumerosDecimales: compararNumerosDecimales(total_costos, unitcost)
                // }
                // error_log('data', data);

                // Detener envio
                if (esDiferente(total_costos, unitcost)) {
                    mostrarError(`La suma del Costo MD, Costo MOD, Costo SRV y Costo CIF no coincide con el total del Costo Estandar. <br/><br/>Suma MD, MOD, SRV y CIF: ${total_costos} <br/>Costo Estandar: ${unitcost}<br/><br/>`);
                }
                // mostrarError('Detener envio.');
            }
        }

        return { beforeSubmit }

    });
