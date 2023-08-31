// Notas del archivo:
// - Secuencia de comando:
//      - Biomont SL Descargar Excel Cos Est y Rea (customscript_bio_sl_desexc_cosestrea)

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['./lib/Bio.Library.Search', './lib/Bio.Library.Process', 'N'],

    function (objSearch, objProcess, N) {

        const { log, file, render, encode } = N;

        /******************/

        // Crear XLS
        function createXLSFile(content) {

            let base64fileEncodedString = encode.convert({
                string: content,
                inputEncoding: encode.Encoding.UTF_8,
                outputEncoding: encode.Encoding.BASE_64
            });

            return file.create({
                name: 'Reporte.xls',
                fileType: file.Type.EXCEL,
                encoding: file.Encoding.UTF_8,
                contents: base64fileEncodedString,
            })
        }

        // Crear Excel
        function createExcel(transactionList, dateFrom, dateTo) {
            // Nombre del archivo
            let typeRep = 'reporteCostoEstandarCostoReal';
            let titleDocument = 'Reporte de costo estandar por elementos del costo';

            // Crear Excel - Contenido dinamico
            let xlsContent = file.load('./template/Excel/reporte_costo_estandar_costo_real.ftl').getContents();
            let renderer = render.create();
            renderer.templateContent = xlsContent;

            // Enviar datos a Excel
            renderer.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: "input",
                data: {
                    data: JSON.stringify({
                        name: titleDocument,
                        dateFrom: dateFrom,
                        dateTo: dateTo,
                        transactions: transactionList
                    })
                }
            });

            // Crear XLS
            let rendererString = renderer.renderAsString();
            let xlsFile = createXLSFile(rendererString);

            // Reescribir datos de Excel
            xlsFile.name = `biomont_${typeRep}_${dateFrom}_${dateTo}.xls`;

            return { xlsFile };
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
            // log.debug('parameteres', scriptContext.request.parameters);

            if (scriptContext.request.method == 'GET') {
                // Obtener datos por url
                subsidiary = scriptContext.request.parameters['_subsidiary'];
                dateFrom = scriptContext.request.parameters['_start'];
                dateTo = scriptContext.request.parameters['_end'];

                if (scriptContext.request.parameters['_button'] == 'excel') {
                    // Obtener datos por search
                    let dataOTByFecha = objSearch.getDataOTByFecha(subsidiary, dateFrom, dateTo);
                    let dataOT = objSearch.getDataOTByLote(subsidiary, dataOTByFecha['data']);
                    let dataRevaluacion = objSearch.getDataRevaluacion(subsidiary);
                    let dataOT_RegistrosRelacionados = objSearch.getDataOT_RegistrosRelacionados(subsidiary, dataOTByFecha['data']);
                    let dataOT_EmisionesOrdenesProduccion = objSearch.getDataOT_EmisionesOrdenesProduccion(subsidiary, dataOT_RegistrosRelacionados['data'])
                    let dataOT_DatosProduccion = objSearch.getDataOT_DatosProduccion(subsidiary, dateFrom, dateTo, dataOT['data']);
                    let dataOT_Completo = objProcess.getDataOT_Completo(dataOT['data'], dataRevaluacion['data'], dataOT_RegistrosRelacionados['data'], dataOT_EmisionesOrdenesProduccion['data'], dataOT_DatosProduccion['data']);

                    // Procesar reporte
                    let dataReporte = objProcess.getReporte_CSV_Excel(dataOT_Completo);

                    // Crear Excel
                    let { xlsFile } = createExcel(dataReporte, dateFrom, dateTo);

                    // Descargar Excel
                    scriptContext.response.writeFile({
                        file: xlsFile
                    });
                }
            }
        }

        return { onRequest }

    });
