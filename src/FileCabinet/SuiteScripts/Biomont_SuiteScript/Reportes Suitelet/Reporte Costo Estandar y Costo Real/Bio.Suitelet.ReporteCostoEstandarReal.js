// Notas del archivo:
// - Secuencia de comando:
//      - Biomont SL Reporte Costo Estandar y Real (customscript_bio_sl_rep_cosestrea)

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['./lib/Bio.Library.Search', './lib/Bio.Library.Process', './lib/Bio.Library.Helper', 'N'],

    function (objSearch, objProcess, objHelper, N) {

        const { log, runtime, email, file } = N;
        const { serverWidget, message } = N.ui;

        /******************/

        const DATA = {
            'clientScriptModulePath': './Bio.Client.ReporteCostoEstandarReal.js'
        }

        // Crear formulario
        function createForm() {
            // Crear formulario
            let form = serverWidget.createForm({
                title: 'Reporte de costo estandar por elementos del costo',
                hideNavBar: false
            });

            // Mostrar Grupo de Campos
            form.addFieldGroup({
                id: 'custpage_group',
                label: 'Filters',
            })
            let fieldSubsidiary = form.addField({
                id: 'custpage_field_subsidiary',
                type: serverWidget.FieldType.SELECT,
                label: 'Subsidiaria',
                source: 'subsidiary',
                container: 'custpage_group'
            });
            let fieldDateFrom = form.addField({
                id: 'custpage_field_date_from',
                type: serverWidget.FieldType.DATE,
                label: 'Fecha Desde',
                container: 'custpage_group'
            });
            let fieldDateTo = form.addField({
                id: 'custpage_field_date_to',
                type: serverWidget.FieldType.DATE,
                label: 'Fecha Hasta',
                container: 'custpage_group'
            });
            let fieldCheckPaginate = form.addField({
                id: 'custpage_field_check_paginate',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Paginación',
                container: 'custpage_group'
            });
            // let fieldItem = form.addField({
            //     id: 'custpage_field_item',
            //     type: serverWidget.FieldType.TEXT,
            //     label: 'Codigo del Artículo',
            //     container: 'custpage_group'
            // });

            // Asociar ClientScript al formulario
            form.clientScriptModulePath = DATA.clientScriptModulePath;

            // Mostrar botones
            // form.addSubmitButton({ label: 'Consultar' });
            form.addButton({
                id: 'custpage_button_consultar',
                label: 'Consultar',
                functionName: 'consultar()'
            });
            form.addButton({
                id: 'custpage_button_csv',
                label: 'CSV',
                functionName: 'csv()'
            });
            form.addButton({
                id: 'custpage_button_excel',
                label: 'Excel',
                functionName: 'excel()'
            });

            // Obtener datos
            let { today, firstDayOfMonth, firstDayOfMonthPast, lastDayOfMonthPast, monthOfMonthPast } = objHelper.getDate();
            let { user } = objHelper.getUser();
            subsidiary = user.subsidiary;
            dateFrom = firstDayOfMonthPast;
            dateTo = lastDayOfMonthPast;
            checkPaginate = 'F'

            // Setear datos al formulario
            fieldSubsidiary.defaultValue = subsidiary;
            fieldDateFrom.defaultValue = dateFrom;
            fieldDateTo.defaultValue = dateTo;
            fieldCheckPaginate.defaultValue = checkPaginate;

            return { form, fieldSubsidiary, fieldDateFrom, fieldDateTo, fieldCheckPaginate }
        }

        // Crear sublista
        function createSublist(form, dataReporte, checkPaginate) {
            let fDecimal = 6;

            // Tipo de Sublista
            let sublistType = null;
            if (checkPaginate == 'F') {
                sublistType = serverWidget.SublistType.LIST;
            } else if (checkPaginate == 'T') {
                sublistType = serverWidget.SublistType.STATICLIST;
            }

            // Agregar sublista
            let sublist = form.addSublist({
                id: 'custpage_sublist_reporte_costo_estandar',
                type: sublistType, // serverWidget.SublistType.LIST, serverWidget.SublistType.STATICLIST
                label: 'Reporte de costo estandar por elementos del costo'
            });

            // Setear cabecera a sublista
            // ORDEN DE TRABAJO
            sublist.addField({ id: 'custpage_orden_trabajo', type: serverWidget.FieldType.TEXT, label: 'ORDEN DE TRABAJO' });
            sublist.addField({ id: 'custpage_lote', type: serverWidget.FieldType.TEXT, label: 'LOTE' });
            sublist.addField({ id: 'custpage_tipo_orden_trabajo', type: serverWidget.FieldType.TEXT, label: 'TIPO DE ORDEN DE TRABAJO' });
            sublist.addField({ id: 'custpage_estado', type: serverWidget.FieldType.TEXT, label: 'ESTADO' });
            sublist.addField({ id: 'custpage_fec', type: serverWidget.FieldType.TEXT, label: 'FECHA' });
            sublist.addField({ id: 'custpage_fec_ini_prod', type: serverWidget.FieldType.TEXT, label: 'FECHA DE INICIO DE LA PRODUCCIÓN' });
            sublist.addField({ id: 'custpage_fec_fin_prod', type: serverWidget.FieldType.TEXT, label: 'FECHA DE FINALIZACIÓN DE PRODUCCIÓN' });
            sublist.addField({ id: 'custpage_fec_cie_prod', type: serverWidget.FieldType.TEXT, label: 'FECHA DE CIERRE DE PRODUCCIÓN' });
            sublist.addField({ id: 'custpage_fec_cos_est', type: serverWidget.FieldType.TEXT, label: 'FECHA DE COSTO ESTANDAR' });
            sublist.addField({ id: 'custpage_centro_costo', type: serverWidget.FieldType.TEXT, label: 'CENTRO DE COSTO' });
            sublist.addField({ id: 'custpage_codigo_oracle', type: serverWidget.FieldType.TEXT, label: 'CÓDIGO ORACLE' });
            sublist.addField({ id: 'custpage_descripcion', type: serverWidget.FieldType.TEXT, label: 'DESCRIPCIÓN' });
            sublist.addField({ id: 'custpage_cantidad', type: serverWidget.FieldType.TEXT, label: 'CANTIDAD' });
            sublist.addField({ id: 'custpage_cos_tot', type: serverWidget.FieldType.TEXT, label: 'COSTO</br> TOTAL' });
            // COSTO ESTANDAR
            sublist.addField({ id: 'custpage_cos_est_md', type: serverWidget.FieldType.TEXT, label: 'COSTO</br> ESTANDAR</br> MD' }); // TEXT, CURRENCY
            sublist.addField({ id: 'custpage_cos_est_mod', type: serverWidget.FieldType.TEXT, label: 'COSTO</br> ESTANDAR</br> MOD' });
            sublist.addField({ id: 'custpage_cos_est_srv', type: serverWidget.FieldType.TEXT, label: 'COSTO</br> ESTANDAR</br> SRV' });
            sublist.addField({ id: 'custpage_cos_est_cif', type: serverWidget.FieldType.TEXT, label: 'COSTO</br> ESTANDAR</br> CIF' });
            sublist.addField({ id: 'custpage_cos_est_tot', type: serverWidget.FieldType.TEXT, label: 'COSTO</br> ESTANDAR</br> C.U.' });
            // COSTO REAL
            sublist.addField({ id: 'custpage_cos_rea_md', type: serverWidget.FieldType.TEXT, label: 'COSTO</br> REAL</br> MD' });
            sublist.addField({ id: 'custpage_cos_rea_mod', type: serverWidget.FieldType.TEXT, label: 'COSTO</br> REAL</br> MOD' });
            sublist.addField({ id: 'custpage_cos_rea_srv', type: serverWidget.FieldType.TEXT, label: 'COSTO</br> REAL</br> SRV' });
            sublist.addField({ id: 'custpage_cos_rea_cif', type: serverWidget.FieldType.TEXT, label: 'COSTO</br> REAL</br> CIF' });
            sublist.addField({ id: 'custpage_cos_rea_tot', type: serverWidget.FieldType.TEXT, label: 'COSTO</br> REAL</br> C.U.' });
            // DIFERENCIA SOLES
            sublist.addField({ id: 'custpage_cos_dif_md', type: serverWidget.FieldType.TEXT, label: 'DIF S/.</br> MD' });
            sublist.addField({ id: 'custpage_cos_dif_mod', type: serverWidget.FieldType.TEXT, label: 'DIF S/.</br> MOD' });
            sublist.addField({ id: 'custpage_cos_dif_srv', type: serverWidget.FieldType.TEXT, label: 'DIF S/.</br> SRV' });
            sublist.addField({ id: 'custpage_cos_dif_cif', type: serverWidget.FieldType.TEXT, label: 'DIF S/.</br> CIF' });
            sublist.addField({ id: 'custpage_cos_dif_tot', type: serverWidget.FieldType.TEXT, label: 'DIF S/.</br> C.U.' });
            // DIFERENCIA %
            sublist.addField({ id: 'custpage_cos_dif_md_', type: serverWidget.FieldType.TEXT, label: 'DIF %</br> MD' });
            sublist.addField({ id: 'custpage_cos_dif_mod_', type: serverWidget.FieldType.TEXT, label: 'DIF %</br> MOD' });
            sublist.addField({ id: 'custpage_cos_dif_srv_', type: serverWidget.FieldType.TEXT, label: 'DIF %</br> SRV' });
            sublist.addField({ id: 'custpage_cos_dif_cif_', type: serverWidget.FieldType.TEXT, label: 'DIF %</br> CIF' });
            sublist.addField({ id: 'custpage_cos_dif_tot_', type: serverWidget.FieldType.TEXT, label: 'DIF %</br> C.U.' });

            // Setear los datos obtenidos a sublista
            dataReporte.forEach((element, i) => {
                // ORDEN DE TRABAJO
                if (element.orden_trabajo) {
                    sublist.setSublistValue({ id: 'custpage_orden_trabajo', line: i, value: element.orden_trabajo });
                }
                if (element.lote) {
                    sublist.setSublistValue({ id: 'custpage_lote', line: i, value: element.lote });
                }
                if (element.tipo_orden_trabajo) {
                    sublist.setSublistValue({ id: 'custpage_tipo_orden_trabajo', line: i, value: element.tipo_orden_trabajo_nombre });
                }
                if (element.estado) {
                    sublist.setSublistValue({ id: 'custpage_estado', line: i, value: element.estado });
                }
                if (element.fec) {
                    sublist.setSublistValue({ id: 'custpage_fec', line: i, value: element.fec });
                }
                if (element.fec_ini_prod) {
                    sublist.setSublistValue({ id: 'custpage_fec_ini_prod', line: i, value: element.fec_ini_prod });
                }
                if (element.fec_fin_prod) {
                    sublist.setSublistValue({ id: 'custpage_fec_fin_prod', line: i, value: element.fec_fin_prod });
                }
                if (element.fec_cie_prod) {
                    sublist.setSublistValue({ id: 'custpage_fec_cie_prod', line: i, value: element.fec_cie_prod });
                }
                if (element.fec_cos_est) {
                    sublist.setSublistValue({ id: 'custpage_fec_cos_est', line: i, value: element.fec_cos_est });
                }
                if (element.centro_costo) {
                    sublist.setSublistValue({ id: 'custpage_centro_costo', line: i, value: element.centro_costo });
                }
                if (element.codigo_oracle) {
                    sublist.setSublistValue({ id: 'custpage_codigo_oracle', line: i, value: element.codigo_oracle });
                }
                if (element.descripcion) {
                    sublist.setSublistValue({ id: 'custpage_descripcion', line: i, value: element.descripcion });
                }
                if (element.cantidad_construido) {
                    sublist.setSublistValue({ id: 'custpage_cantidad', line: i, value: element.cantidad_construido });
                }
                let costo_total = element.cantidad_construido * Math.round10(element.costo_real_total, -fDecimal);
                if (costo_total || objHelper.isNumeric(costo_total)) { // Valida que sea numerico, en caso el valor sea 0
                    sublist.setSublistValue({ id: 'custpage_cos_tot', line: i, value: Math.round10(costo_total, -fDecimal).toFixed(fDecimal) });
                }

                // COSTO ESTANDAR
                if (element.costo_estandar_md || objHelper.isNumeric(element.costo_estandar_md)) {
                    sublist.setSublistValue({ id: 'custpage_cos_est_md', line: i, value: Math.round10(element.costo_estandar_md, -fDecimal).toFixed(fDecimal) });
                }
                if (element.costo_estandar_mod || objHelper.isNumeric(element.costo_estandar_mod)) {
                    sublist.setSublistValue({ id: 'custpage_cos_est_mod', line: i, value: Math.round10(element.costo_estandar_mod, -fDecimal).toFixed(fDecimal) });
                }
                if (element.costo_estandar_srv || objHelper.isNumeric(element.costo_estandar_srv)) {
                    sublist.setSublistValue({ id: 'custpage_cos_est_srv', line: i, value: Math.round10(element.costo_estandar_srv, -fDecimal).toFixed(fDecimal) });
                }
                if (element.costo_estandar_cif || objHelper.isNumeric(element.costo_estandar_cif)) {
                    sublist.setSublistValue({ id: 'custpage_cos_est_cif', line: i, value: Math.round10(element.costo_estandar_cif, -fDecimal).toFixed(fDecimal) });
                }
                if (element.costo_estandar_total || objHelper.isNumeric(element.costo_estandar_total)) {
                    sublist.setSublistValue({ id: 'custpage_cos_est_tot', line: i, value: `<b>${Math.round10(element.costo_estandar_total, -fDecimal).toFixed(fDecimal)}</b>` });
                }

                // COSTO REAL
                if (element.costo_real_md || objHelper.isNumeric(element.costo_real_md)) {
                    sublist.setSublistValue({ id: 'custpage_cos_rea_md', line: i, value: Math.round10(element.costo_real_md, -fDecimal).toFixed(fDecimal) });
                }
                if (element.costo_real_mod || objHelper.isNumeric(element.costo_real_mod)) {
                    sublist.setSublistValue({ id: 'custpage_cos_rea_mod', line: i, value: Math.round10(element.costo_real_mod, -fDecimal).toFixed(fDecimal) });
                }
                if (element.costo_real_srv || objHelper.isNumeric(element.costo_real_srv)) {
                    sublist.setSublistValue({ id: 'custpage_cos_rea_srv', line: i, value: Math.round10(element.costo_real_srv, -fDecimal).toFixed(fDecimal) });
                }
                if (element.costo_real_cif || objHelper.isNumeric(element.costo_real_cif)) {
                    sublist.setSublistValue({ id: 'custpage_cos_rea_cif', line: i, value: Math.round10(element.costo_real_cif, -fDecimal).toFixed(fDecimal) });
                }
                if (element.costo_real_total || objHelper.isNumeric(element.costo_real_total)) {
                    sublist.setSublistValue({ id: 'custpage_cos_rea_tot', line: i, value: `<b>${Math.round10(element.costo_real_total, -fDecimal).toFixed(fDecimal)}</b>` });
                }

                // DIFERENCIA SOLES
                let dif_md = Math.round10(element.costo_estandar_md, -fDecimal) - Math.round10(element.costo_real_md, -fDecimal);
                let dif_mod = Math.round10(element.costo_estandar_mod, -fDecimal) - Math.round10(element.costo_real_mod, -fDecimal);
                let dif_srv = Math.round10(element.costo_estandar_srv, -fDecimal) - Math.round10(element.costo_real_srv, -fDecimal);
                let dif_cif = Math.round10(element.costo_estandar_cif, -fDecimal) - Math.round10(element.costo_real_cif, -fDecimal);
                let dif_total = Math.round10(element.costo_estandar_total, -fDecimal) - Math.round10(element.costo_real_total, -fDecimal);
                if (dif_md || objHelper.isNumeric(dif_md)) {
                    sublist.setSublistValue({ id: 'custpage_cos_dif_md', line: i, value: Math.round10(dif_md, -fDecimal).toFixed(fDecimal) });
                }
                if (dif_mod || objHelper.isNumeric(dif_mod)) {
                    sublist.setSublistValue({ id: 'custpage_cos_dif_mod', line: i, value: Math.round10(dif_mod, -fDecimal).toFixed(fDecimal) });
                }
                if (dif_srv || objHelper.isNumeric(dif_srv)) {
                    sublist.setSublistValue({ id: 'custpage_cos_dif_srv', line: i, value: Math.round10(dif_srv, -fDecimal).toFixed(fDecimal) });
                }
                if (dif_cif || objHelper.isNumeric(dif_cif)) {
                    sublist.setSublistValue({ id: 'custpage_cos_dif_cif', line: i, value: Math.round10(dif_cif, -fDecimal).toFixed(fDecimal) });
                }
                if (dif_total || objHelper.isNumeric(dif_total)) {
                    sublist.setSublistValue({ id: 'custpage_cos_dif_tot', line: i, value: `<b>${Math.round10(dif_total, -fDecimal).toFixed(fDecimal)}</b>` });
                }

                // DIFERENCIA %
                let dif_md_ = (dif_md / Math.round10(element.costo_real_md, -fDecimal)) * 100;
                let dif_mod_ = (dif_mod / Math.round10(element.costo_real_mod, -fDecimal)) * 100;
                let dif_srv_ = (dif_srv / Math.round10(element.costo_real_srv, -fDecimal)) * 100;
                let dif_cif_ = (dif_cif / Math.round10(element.costo_real_cif, -fDecimal)) * 100;
                let dif_total_ = (dif_total / Math.round10(element.costo_real_total, -fDecimal)) * 100;
                if (dif_md_ || objHelper.isNumeric(dif_md_)) {
                    sublist.setSublistValue({ id: 'custpage_cos_dif_md_', line: i, value: `${Math.round10(dif_md_, -2).toFixed(2)}%` });
                }
                if (dif_mod_ || objHelper.isNumeric(dif_mod_)) {
                    sublist.setSublistValue({ id: 'custpage_cos_dif_mod_', line: i, value: `${Math.round10(dif_mod_, -2).toFixed(2)}%` });
                }
                if (dif_srv_ || objHelper.isNumeric(dif_srv_)) {
                    sublist.setSublistValue({ id: 'custpage_cos_dif_srv_', line: i, value: `${Math.round10(dif_srv_, -2).toFixed(2)}%` });
                }
                if (dif_cif_ || objHelper.isNumeric(dif_cif_)) {
                    sublist.setSublistValue({ id: 'custpage_cos_dif_cif_', line: i, value: `${Math.round10(dif_cif_, -2).toFixed(2)}%` });
                }
                if (dif_total_ || objHelper.isNumeric(dif_total_)) {
                    sublist.setSublistValue({ id: 'custpage_cos_dif_tot_', line: i, value: `<b>${Math.round10(dif_total_, -2).toFixed(2)}%</b>` });
                }
            });

            // Setear cantidad de registros
            if (checkPaginate == 'F') {
                var numLines = sublist.lineCount;
                sublist.helpText = `Cantidad de registros: ${numLines}`;
            }
        }

        // Crear csv
        function createCSV(dataReporte, dateFrom, dateTo) {
            // Nombre del archivo
            let typeRep = 'reporteCostoEstandarCostoReal';
            let titleDocument = 'Reporte de costo estandar por elementos del costo';

            // Crear CSV
            let csvData = [];

            // Setear cabecera de csv
            let current = [];
            // ORDEN DE TRABAJO
            current.push('ORDEN DE TRABAJO');
            current.push('LOTE');
            current.push('TIPO DE ORDEN DE TRABAJO');
            current.push('ESTADO');
            current.push('FECHA');
            current.push('FECHA DE INICIO DE LA PRODUCCION');
            current.push('FECHA DE FINALIZACION DE PRODUCCION');
            current.push('FECHA DE CIERRE DE PRODUCCION');
            current.push('FECHA DE COSTO ESTANDAR');
            current.push('CENTRO DE COSTO');
            current.push('CODIGO ORACLE');
            current.push('DESCRIPCION');
            current.push('CANTIDAD');
            current.push('COSTO TOTAL');
            // COSTO ESTANDAR
            current.push('COSTO EST MD');
            current.push('COSTO EST MOD');
            current.push('COSTO EST SRV');
            current.push('COSTO EST CIF');
            current.push('COSTO EST C.U.');
            // COSTO REAL
            current.push('COSTO REAL MD');
            current.push('COSTO REAL MOD');
            current.push('COSTO REAL SRV');
            current.push('COSTO REAL CIF');
            current.push('COSTO REAL C.U.');
            // DIFERENCIA SOLES
            current.push('DIF S/. MD');
            current.push('DIF S/. MOD');
            current.push('DIF S/. SRV');
            current.push('DIF S/. CIF');
            current.push('DIF S/. C.U.');
            // DIFERENCIA %
            current.push('DIF % MD');
            current.push('DIF % MOD');
            current.push('DIF % SRV');
            current.push('DIF % CIF');
            current.push('DIF % C.U.');

            current = current.join(';');
            csvData.push(current);

            // Setear contenido de csv
            dataReporte.forEach((element, i) => {
                let current = [];
                // ORDEN DE TRABAJO
                current.push(element.orden_trabajo);
                current.push(element.lote);
                current.push(element.tipo_orden_trabajo_nombre);
                current.push(element.estado);
                current.push(element.fec);
                current.push(element.fec_ini_prod);
                current.push(element.fec_fin_prod);
                current.push(element.fec_cie_prod);
                current.push(element.fec_cos_est);
                current.push(element.centro_costo);
                current.push(element.codigo_oracle);
                current.push(element.descripcion);
                current.push(element.cantidad_construido);
                current.push(element.costo_total);
                // COSTO ESTANDAR
                current.push(element.costo_estandar_md);
                current.push(element.costo_estandar_mod);
                current.push(element.costo_estandar_srv);
                current.push(element.costo_estandar_cif);
                current.push(element.costo_estandar_total);
                // COSTO REAL
                current.push(element.costo_real_md);
                current.push(element.costo_real_mod);
                current.push(element.costo_real_srv);
                current.push(element.costo_real_cif);
                current.push(element.costo_real_total);
                // DIFERENCIA SOLES
                current.push(element.dif_md);
                current.push(element.dif_mod);
                current.push(element.dif_srv);
                current.push(element.dif_cif);
                current.push(element.dif_total);
                // DIFERENCIA %
                current.push(element.dif_md_);
                current.push(element.dif_mod_);
                current.push(element.dif_srv_);
                current.push(element.dif_cif_);
                current.push(element.dif_total_);

                current = current.join(';');
                csvData.push(current);
            });
            csvData = csvData.join("\r\n");

            let csvFile = file.create({
                name: `biomont_${typeRep}_${dateFrom}_${dateTo}.csv`,
                fileType: file.Type.CSV,
                contents: csvData,
                encoding: file.Encoding.UTF_8,
            });

            return { csvFile, titleDocument };
        }

        // Enviar email
        function sendEmail(csvFile, titleDocument, form) {
            // Enviar email
            let { user } = objHelper.getUser();

            email.send({
                author: user.id,
                recipients: user.id,
                subject: `${titleDocument}`,
                body: ' ',
                attachments: [csvFile]
            });

            form.addPageInitMessage({
                type: message.Type.INFORMATION,
                message: 'Se envio el archivo CSV a su correo.',
                duration: 25000 // 25 segundos
            });
        }

        // Validar cantidad de registros
        function validarCantidadRegistros(form, scriptContext, dataValidar, recomendacion) {
            let cantidad = 0;
            dataValidar.forEach(element => {
                cantidad += element.length;
            });

            if (cantidad > 4000) {
                form.addPageInitMessage({
                    type: message.Type.WARNING,
                    message: `La cantidad de registros supera los 4000 registros. Se recomienda usar la opción ${recomendacion}. Cantidad de registros: ${cantidad}.`,
                    duration: 25000 // 25 segundos
                });
                scriptContext.response.writePage(form);
                return true;
            }
            return false;
        }

        /******************/

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        function onRequest(scriptContext) {
            // log.debug('method', scriptContext.request.method);
            // log.debug('parameters', scriptContext.request.parameters);

            if (scriptContext.request.method == 'GET') {
                // Crear formulario
                let { form, fieldSubsidiary, fieldDateFrom, fieldDateTo, fieldCheckPaginate } = createForm();

                // Obtener datos por url
                let button = scriptContext.request.parameters['_button'];
                let subsidiary = scriptContext.request.parameters['_subsidiary'];
                let dateFrom = scriptContext.request.parameters['_start'];
                let dateTo = scriptContext.request.parameters['_end'];
                let checkPaginate = scriptContext.request.parameters['_paginate'];

                if (button == 'consultar' || button == 'csv') {

                    // Setear datos al formulario
                    fieldSubsidiary.defaultValue = subsidiary;
                    fieldDateFrom.defaultValue = dateFrom;
                    fieldDateTo.defaultValue = dateTo;
                    fieldCheckPaginate.defaultValue = checkPaginate;

                    // Obtener datos por search
                    let dataOTByFecha = objSearch.getDataOTByFecha(subsidiary, dateFrom, dateTo);
                    let dataOT = objSearch.getDataOTByLote(subsidiary, dataOTByFecha['data']);
                    let dataRevaluacion = objSearch.getDataRevaluacion(subsidiary);
                    let dataOT_RegistrosRelacionados = objSearch.getDataOT_RegistrosRelacionados(subsidiary, dataOTByFecha['data']);
                    let dataOT_EmisionesOrdenesProduccion = objSearch.getDataOT_EmisionesOrdenesProduccion(subsidiary, dataOT_RegistrosRelacionados['data'])
                    let dataOT_DatosProduccion = objSearch.getDataOT_DatosProduccion(subsidiary, dateFrom, dateTo, dataOT['data']);
                    let dataConf_CentroCosto_Linea = objSearch.getDataConf_CentroCosto_Linea();
                    let dataOT_Completo = objProcess.getDataOT_Completo(dataOT['data'], dataRevaluacion['data'], dataOT_RegistrosRelacionados['data'], dataOT_EmisionesOrdenesProduccion['data'], dataOT_DatosProduccion['data'], dataConf_CentroCosto_Linea['data']);

                    // Obtener factor CIF por meses y asignarlos a las OTs
                    let fechas = objHelper.getDatesByOT(dataOT_Completo);
                    let dataFactorCIF = {}; // * Audit: Util, manejo de JSON
                    fechas.forEach(element => {
                        let year = element.year;
                        let month = element.month;

                        let dataReporteGastos_Cuentas6168 = objSearch.getDataReporteGastos_Cuentas6168(subsidiary, year, month);
                        dataFactorCIF[year] = dataFactorCIF[year] || {};
                        dataFactorCIF[year][month] = objProcess.getFactorCIFbyMonth(dataOT_Completo, dataReporteGastos_Cuentas6168['data'], { 'anio': year, 'mes': month });
                    });
                    dataOT_Completo = objProcess.asignarFactorCIFByOTs(dataOT_Completo, dataFactorCIF);
                    // Cerrar Obtener factor CIF por meses y asignarlos a las OTs

                    // Debug
                    // objHelper.error_log('', fechas);
                    // objHelper.error_log('', dataFactorCIF);
                    // objHelper.error_log('', dataOT_Completo);
                    // objHelper.error_log_by_lote('', dataOT_Completo, ['083433']);

                    if (button == 'consultar') {

                        // Procesar reporte
                        let dataReporte = dataOT_Completo

                        // Validar cantidad de registros
                        let dataValidar = [dataReporte];
                        let recomendacion = 'Excel o CSV'
                        if (validarCantidadRegistros(form, scriptContext, dataValidar, recomendacion) == true) return;

                        // Crear sublista
                        createSublist(form, dataReporte, checkPaginate);
                    } else if (button == 'csv') {

                        // Procesar reporte
                        let dataReporte = objProcess.getReporte_CSV_Excel(dataOT_Completo);

                        // Crear csv
                        let { csvFile, titleDocument } = createCSV(dataReporte, dateFrom, dateTo);

                        // Enviar email
                        sendEmail(csvFile, titleDocument, form);
                    }
                }

                // Renderizar formulario
                scriptContext.response.writePage(form);
            }
        }

        return { onRequest }

    });
