/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N'],

    function (N) {

        const { currentRecord, url } = N;

        const scriptId = 'customscript_bio_sl_rep_cosestrea';
        const deployId = 'customdeploy_bio_sl_rep_cosestrea';

        const scriptDownloadId = 'customscript_bio_sl_desexc_cosestrea';
        const deployDownloadId = 'customdeploy_bio_sl_desexc_cosestrea';

        /******************/

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {

            // setTimeout(() => {
            //     let boton1 = document.getElementById('tr_custpage_button');
            //     boton1.classList.add('pgBntB');

            //     let boton2 = document.getElementById('tr_secondarycustpage_button');
            //     boton2.classList.add('pgBntB');
            // }, 500);

        }

        function consultar() {

            // Obtener el currentRecord
            // En una funcion personalizada, no viene ningun currenRecord, entonces debemos usar el modulo base
            // currentRecord.get(), recupera el mismo currentRecord que tiene cada funcion estandar
            let recordContext = currentRecord.get();

            // Recuperar valores de los campos
            let subsidiary = recordContext.getValue('custpage_field_subsidiary')
            let start = recordContext.getText('custpage_field_date_from');
            let end = recordContext.getText('custpage_field_date_to');
            let paginate = recordContext.getText('custpage_field_check_paginate');

            // Obtener url del Suitelet mediante ID del Script y ID del Despliegue
            let suitelet = url.resolveScript({
                deploymentId: deployId,
                scriptId: scriptId,
                params: {
                    _button: 'consultar',
                    _subsidiary: subsidiary,
                    _start: start,
                    _end: end,
                    _paginate: paginate
                }
            })

            // Evitar que aparezca el mensaje 'Estas seguro que deseas salir de la pantalla'
            setWindowChanged(window, false);

            // Redirigir a la url
            window.location.href = suitelet;
        }

        function csv() {

            // Obtener el currentRecord
            // En una funcion personalizada, no viene ningun currenRecord, entonces debemos usar el modulo base
            // currentRecord.get(), recupera el mismo currentRecord que tiene cada funcion estandar
            let recordContext = currentRecord.get();

            // Recuperar valores de los campos
            let subsidiary = recordContext.getValue('custpage_field_subsidiary')
            let start = recordContext.getText('custpage_field_date_from');
            let end = recordContext.getText('custpage_field_date_to');
            let paginate = recordContext.getText('custpage_field_check_paginate');

            // Obtener url del Suitelet mediante ID del Script y ID del Despliegue
            let suitelet = url.resolveScript({
                deploymentId: deployId,
                scriptId: scriptId,
                params: {
                    _button: 'csv',
                    _subsidiary: subsidiary,
                    _start: start,
                    _end: end,
                    _paginate: paginate
                }
            })

            // Evitar que aparezca el mensaje 'Estas seguro que deseas salir de la pantalla'
            setWindowChanged(window, false);

            // Redirigir a la url
            window.location.href = suitelet;
        }

        function excel() {

            // Obtener el currentRecord
            // En una funcion personalizada, no viene ningun currenRecord, entonces debemos usar el modulo base
            // currentRecord.get(), recupera el mismo currentRecord que tiene cada funcion estandar
            let recordContext = currentRecord.get();

            // Recuperar valores de los campos
            let subsidiary = recordContext.getValue('custpage_field_subsidiary')
            let start = recordContext.getText('custpage_field_date_from');
            let end = recordContext.getText('custpage_field_date_to');
            let paginate = recordContext.getText('custpage_field_check_paginate');

            // Obtener url del Suitelet mediante ID del Script y ID del Despliegue
            let suitelet = url.resolveScript({
                deploymentId: deployDownloadId,
                scriptId: scriptDownloadId,
                params: {
                    _button: 'excel',
                    _subsidiary: subsidiary,
                    _start: start,
                    _end: end,
                    _paginate: paginate
                }
            });

            // Evitar que aparezca el mensaje 'Estas seguro que deseas salir de la pantalla'
            setWindowChanged(window, false);

            // Abrir url
            window.open(suitelet);
        }

        return {
            pageInit: pageInit,
            consultar: consultar,
            csv: csv,
            excel: excel
        };

    });
