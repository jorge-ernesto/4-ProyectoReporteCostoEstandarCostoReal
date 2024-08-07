/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['./Bio.Library.Helper', 'N'],

    function (objHelper, N) {

        const { log, search } = N;

        function getDataOTByFecha(subsidiary, dateFrom, dateTo, lote = '') {

            // Declarar variables
            let result = {};
            let data = [];

            // Filtro de subsidiary
            let array_where_subsidiary = ["subsidiary", "anyof", "@NONE@"];
            if (subsidiary != '') {
                array_where_subsidiary = ["subsidiary", "anyof", subsidiary];
            }

            // Declarar search
            let searchObject = {
                type: 'workorder',
                columns: [
                    search.createColumn({ name: "custbodybio_cam_lote", label: "LOTE" })
                ],
                filters: [
                    ["mainline", "is", "T"],
                    "AND",
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["trandate", "within", dateFrom, dateTo],
                    "AND",
                    ["status", "anyof", "WorkOrd:H", "WorkOrd:D", "WorkOrd:B"],
                    "AND",
                    ["item.custitem3", "anyof", "2", "6", "1", "3", "10", "11", "9", "48", "4"],
                    "AND",
                    array_where_subsidiary
                ],
            };

            // Filtro de lote
            if (lote != '') {
                searchObject.filters.push('AND');
                searchObject.filters.push(['custbodybio_cam_lote', 'is', `${lote}`]);
            }

            // Crear search
            let searchContext = search.create(searchObject);

            // Cantidad de registros en search
            // let count = searchContext.runPaged().count;
            // log.debug('', 'getDataOTByFecha');
            // log.debug('', count);

            // Recorrer search
            searchContext.run().each(node => {
                // Obtener informacion
                let columns = node.columns;
                let lote = node.getValue(columns[0]); // LOTE

                // Insertar informacion en array
                data.push({
                    lote: lote,
                });
                return true; // La funcion each debes indicarle si quieres que siga iterando o no
            })

            // Retornar informacion
            result = {
                data: data
            }
            // log.debug('', 'getDataOTByFecha');
            // log.debug('', result);
            // objHelper.error_log('getDataOTByFecha', result);
            return result;
        }

        function getDataOTByLote(subsidiary, dataOTByFecha) {

            // Declarar variables
            let result = {};
            let data = [];

            // Filtro de subsidiary
            let array_where_subsidiary = ["subsidiary", "anyof", "@NONE@"];
            if (subsidiary != '') {
                array_where_subsidiary = ["subsidiary", "anyof", subsidiary];
            }

            // Declarar search
            let searchObject = {
                type: 'workorder',
                columns: [
                    search.createColumn({ name: "internalid", label: "ID INTERNO" }),
                    search.createColumn({
                        name: "tranid",
                        sort: search.Sort.DESC,
                        label: "ORDEN DE TRABAJO"
                    }),
                    search.createColumn({ name: "custbodybio_cam_lote", label: "LOTE" }),
                    search.createColumn({ name: "custbody8", label: "TIPO DE ORDEN DE TRABAJO" }),
                    search.createColumn({ name: "trandate", label: "FECHA" }),
                    search.createColumn({ name: "custbody126", label: "FECHA DE INICIO DE LA PRODUCCIÓN" }),
                    search.createColumn({ name: "enddate", label: "FECHA DE FINALIZACIÓN DE PRODUCCION" }),
                    search.createColumn({ name: "class", label: "CENTRO DE COSTO" }),
                    search.createColumn({
                        name: "class",
                        join: "item",
                        label: "Centro de Costo"
                    }),
                    search.createColumn({ name: "item", label: "CÓDIGO ORACLE" }),
                    search.createColumn({
                        name: "salesdescription",
                        join: "item",
                        label: "DESCRIPCIÓN"
                    }),
                    search.createColumn({ name: "built", label: "CANTIDAD CONSTRUIDO / REAL" }),
                    search.createColumn({
                        name: "custitem3",
                        join: "item",
                        label: "LINEA"
                    }),
                    search.createColumn({ name: "quantity", label: "CANTIDAD TEORICA" }),
                    search.createColumn({
                        name: "custitem5",
                        join: "item",
                        label: "VOLUMEN"
                    }),
                    search.createColumn({ name: "statusref", label: "ESTADO" })
                ],
                filters: [
                    ["mainline", "is", "T"],
                    "AND",
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["status", "anyof", "WorkOrd:H", "WorkOrd:D", "WorkOrd:B"],
                    "AND",
                    ["item.custitem3", "anyof", "2", "6", "1", "3", "10", "11", "9", "48", "4"],
                    "AND",
                    ["memo", "isnot", "VOID"],
                    "AND",
                    array_where_subsidiary
                ],
            };

            // Filtro de lotes
            if (Object.keys(dataOTByFecha).length <= 0) {
                searchObject.filters.push('AND');
                searchObject.filters.push(['custbodybio_cam_lote', 'is', '']); // Esto es para que no traiga ninguna OT si no hay ningun Lote
            } else {
                let array_where_lotes = getFilterLote(dataOTByFecha);
                searchObject.filters.push('AND');
                searchObject.filters.push(array_where_lotes);
            }

            // Crear search
            let searchContext = search.create(searchObject);

            // Cantidad de registros en search
            // let count = searchContext.runPaged().count;
            // log.debug('', 'getDataOTByLote');
            // log.debug('', count);

            // Recorrer search
            searchContext.run().each(node => {
                // Obtener informacion
                let columns = node.columns;
                let id_interno = node.getValue(columns[0]); // ID INTERNO
                let orden_trabajo = node.getValue(columns[1]); // ORDEN DE TRABAJO
                let lote = node.getValue(columns[2]); // LOTE
                let tipo_orden_trabajo = node.getValue(columns[3]); // TIPO DE ORDEN DE TRABAJO
                let tipo_orden_trabajo_nombre = node.getText(columns[3]); // TIPO DE ORDEN DE TRABAJO
                let fec = node.getValue(columns[4]); // FECHA
                let fec_ini_prod = node.getValue(columns[5]); // FECHA DE INICIO DE LA PRODUCCIÓN
                let fec_fin_prod = node.getValue(columns[6]); // FECHA DE FINALIZACIÓN DE PRODUCCION
                let centro_costo = node.getValue(columns[7]); // CENTRO DE COSTO
                let centro_costo_nombre = node.getText(columns[7]); // CENTRO DE COSTO
                let ensamblaje_centro_costo = node.getValue(columns[8]); // ENSAMBLAJE - CENTRO DE COSTO
                let ensamblaje_centro_costo_nombre = node.getText(columns[8]); // ENSAMBLAJE - CENTRO DE COSTO
                let codigo_oracle = node.getText(columns[9]); // CÓDIGO ORACLE
                let descripcion = node.getValue(columns[10]); // DESCRIPCIÓN
                let cantidad_construido = node.getValue(columns[11]); // CANTIDAD CONSTRUIDO / REAL
                let linea = node.getValue(columns[12]); // LINEA
                let linea_nombre = node.getText(columns[12]); // LINEA
                let cantidad_teorica = node.getValue(columns[13]); // CANTIDAD TEORICA
                let volumen = node.getValue(columns[14]); // VOLUMEN
                let estado = node.getText(columns[15]); // ESTADO

                // Insertar informacion en array
                data.push({
                    id_interno: id_interno,
                    orden_trabajo: orden_trabajo,
                    lote: lote,
                    tipo_orden_trabajo: tipo_orden_trabajo,
                    tipo_orden_trabajo_nombre: tipo_orden_trabajo_nombre,
                    fec: fec,
                    fec_ini_prod: fec_ini_prod,
                    fec_fin_prod: fec_fin_prod,
                    centro_costo: centro_costo,
                    centro_costo_nombre: centro_costo_nombre,
                    ensamblaje_centro_costo: ensamblaje_centro_costo,
                    ensamblaje_centro_costo_nombre: ensamblaje_centro_costo_nombre,
                    codigo_oracle: codigo_oracle,
                    descripcion: descripcion,
                    cantidad_construido: cantidad_construido,
                    linea: linea,
                    linea_nombre: linea_nombre,
                    cantidad_teorica: cantidad_teorica,
                    volumen: volumen,
                    estado: estado,
                });
                return true; // La funcion each debes indicarle si quieres que siga iterando o no
            })

            // Retornar informacion
            result = {
                data: data
            }
            // log.debug('', 'getDataOTByLote');
            // log.debug('', result);
            // objHelper.error_log('getDataOTByLote', result);
            return result;
        }

        function getDataRevaluacion(subsidiary) {

            // Declarar variables
            let result = {};
            let data = [];

            // Filtro de subsidiary
            let array_where_subsidiary = ["subsidiary", "anyof", "@NONE@"];
            if (subsidiary != '') {
                array_where_subsidiary = ["subsidiary", "anyof", subsidiary];
            }

            // Crear search
            let searchContext = search.create({
                type: 'inventorycostrevaluation',
                columns: [
                    search.createColumn({
                        name: "trandate",
                        summary: "GROUP",
                        sort: search.Sort.DESC,
                        label: "Date"
                    }),
                    search.createColumn({
                        name: "tranid",
                        summary: "GROUP",
                        sort: search.Sort.DESC,
                        label: "Nro Ref."
                    }),
                    search.createColumn({
                        name: "memo",
                        summary: "MAX",
                        label: "Nota"
                    }),
                    search.createColumn({
                        name: "location",
                        summary: "MAX",
                        label: "Almacén"
                    }),
                    search.createColumn({
                        name: "item",
                        summary: "MAX",
                        label: "Articulo"
                    }),
                    search.createColumn({
                        name: "custbody_bio_cam_cos_md",
                        summary: "MAX",
                        label: "Costo MD"
                    }),
                    search.createColumn({
                        name: "custbody_bio_cam_cos_mod",
                        summary: "MAX",
                        label: "Costo MOD"
                    }),
                    search.createColumn({
                        name: "custbody_bio_cam_cos_srv",
                        summary: "MAX",
                        label: "Costo SRV"
                    }),
                    search.createColumn({
                        name: "custbody_bio_cam_cos_cif",
                        summary: "MAX",
                        label: "Costo CIF"
                    }),
                    search.createColumn({
                        name: "costcomponentstandardcost",
                        summary: "MAX",
                        label: "Costo Estandar"
                    }),
                    search.createColumn({
                        name: "subsidiary",
                        summary: "MAX",
                        label: "Subsidiaria"
                    })
                ],
                filters: [
                    ["mainline", "any", ""],
                    "AND",
                    ["type", "anyof", "InvReval"],
                    "AND",
                    ["location", "anyof", "65"],
                    "AND",
                    array_where_subsidiary
                ],
            });

            // Cantidad de registros en search
            // let count = searchContext.runPaged().count;
            // log.debug('', 'getDataRevaluacion');
            // log.debug('', count);

            // Recorrer search
            searchContext.run().each(node => {
                // Obtener informacion
                let columns = node.columns;
                let trandate = node.getValue(columns[0]);
                let tranid = node.getValue(columns[1]);
                let memo = node.getValue(columns[2]);
                let location = node.getValue(columns[3]);
                let item = node.getValue(columns[4]);
                let costo_estandar_md = node.getValue(columns[5]);
                let costo_estandar_mod = node.getValue(columns[6]);
                let costo_estandar_srv = node.getValue(columns[7]);
                let costo_estandar_cif = node.getValue(columns[8]);
                let costcomponentstandardcost = node.getValue(columns[9]);
                let subsidiary = node.getValue(columns[10]);

                // Insertar informacion en array
                data.push({
                    trandate: trandate,
                    tranid: tranid,
                    memo: memo,
                    location: location,
                    item: item,
                    costo_estandar_md: costo_estandar_md,
                    costo_estandar_mod: costo_estandar_mod,
                    costo_estandar_srv: costo_estandar_srv,
                    costo_estandar_cif: costo_estandar_cif,
                    costcomponentstandardcost: costcomponentstandardcost,
                    subsidiary: subsidiary
                });
                return true; // La funcion each debes indicarle si quieres que siga iterando o no
            })

            // Retornar informacion
            result = {
                data: data
            }
            // log.debug('', 'getDataRevaluacion');
            // log.debug('', result);
            // objHelper.error_log('', result);
            return result;
        }

        function getDataOT_RegistrosRelacionados(subsidiary, dataOTByFecha) {

            // Declarar variables
            let result = {};
            let data = [];

            // Filtro de subsidiary
            let array_where_subsidiary = ["subsidiary", "anyof", "@NONE@"];
            if (subsidiary != '') {
                array_where_subsidiary = ["subsidiary", "anyof", subsidiary];
            }

            // Declarar search
            let searchObject = {
                type: 'workorder',
                columns: [
                    search.createColumn({
                        name: "internalid",
                        summary: "GROUP",
                        label: "ID interno"
                    }),
                    search.createColumn({
                        name: "tranid",
                        summary: "GROUP",
                        sort: search.Sort.DESC,
                        label: "Nro OT"
                    }),
                    search.createColumn({
                        name: "custbodybio_cam_lote",
                        summary: "MAX",
                        label: "Lote"
                    }),
                    search.createColumn({
                        name: "trandate",
                        join: "applyingTransaction",
                        summary: "MAX",
                        label: "Related Records : DATE"
                    }),
                    search.createColumn({
                        name: "type",
                        join: "applyingTransaction",
                        summary: "MAX",
                        label: "Related Records : TYPE"
                    }),
                    search.createColumn({
                        name: "typecode",
                        join: "applyingTransaction",
                        summary: "GROUP",
                        label: "Related Records : TYPECODE"
                    }),
                    search.createColumn({
                        name: "internalid",
                        join: "applyingTransaction",
                        summary: "GROUP",
                        label: "Related Records : INTERNAL ID"
                    }),
                    search.createColumn({
                        name: "tranid",
                        join: "applyingTransaction",
                        summary: "GROUP",
                        sort: search.Sort.ASC,
                        label: "Related Records : NUMBER"
                    })
                ],
                filters: [
                    ["mainline", "any", ""],
                    "AND",
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["status", "anyof", "WorkOrd:H", "WorkOrd:D", "WorkOrd:B"],
                    "AND",
                    array_where_subsidiary,
                    "AND",
                    ["applyingtransaction.type", "anyof", "WOIssue", "WOClose"]
                ],
            };

            // Filtro de lotes
            if (Object.keys(dataOTByFecha).length <= 0) {
                searchObject.filters.push('AND');
                searchObject.filters.push(['custbodybio_cam_lote', 'is', '']); // Esto es para que no traiga ninguna OT si no hay ningun Lote
            } else {
                let array_where_lotes = getFilterLote(dataOTByFecha);
                searchObject.filters.push('AND');
                searchObject.filters.push(array_where_lotes);
            }

            // Crear search
            let searchContext = search.create(searchObject);

            // Cantidad de registros en search
            // let count = searchContext.runPaged().count;
            // log.debug('', 'getDataOT_RegistrosRelacionados');
            // log.debug('', count);

            // Recorrer search - con mas de 4000 registros
            let pageData = searchContext.runPaged({ pageSize: 1000 }); // El minimo de registros que se puede traer por pagina es 50, pondremos 1000 para que en el caso existan 4500 registros, hayan 5 paginas como maximo y no me consuma mucha memoria

            pageData.pageRanges.forEach(function (pageRange) {
                var myPage = pageData.fetch({ index: pageRange.index });
                myPage.data.forEach((row) => {
                    // Obtener informacion
                    let { columns } = row;
                    let orden_trabajo_id_interno = row.getValue(columns[0]); // ID interno
                    let orden_trabajo_numero = row.getValue(columns[1]); // Nro OT
                    // let lote = row.getValue(columns[2]); // Lote
                    let related_record_date = row.getValue(columns[3]); // Related Records : DATE
                    let related_record_type = row.getValue(columns[4]); // Related Records : TYPE
                    let related_record_typecode = row.getValue(columns[5]); // Related Records : TYPECODE
                    let related_record_internal_id = row.getValue(columns[6]); // Related Records : INTERNAL ID
                    let related_record_number = row.getValue(columns[7]); // Related Records : NUMBER

                    // Insertar informacion en array
                    data.push({
                        orden_trabajo_id_interno: orden_trabajo_id_interno,
                        orden_trabajo_numero: orden_trabajo_numero,
                        // lote: lote,
                        related_record_date: related_record_date,
                        related_record_type: related_record_type,
                        related_record_typecode: related_record_typecode,
                        related_record_internal_id: related_record_internal_id,
                        related_record_number: related_record_number
                    });
                });
            });

            // Retornar informacion
            result = {
                data: data,
            }
            // log.debug('', 'getDataOT_RegistrosRelacionados');
            // log.debug('', result);
            // objHelper.error_log('getDataOT_RegistrosRelacionados', result);
            return result;
        }

        function getDataOT_EmisionesOrdenesProduccion(subsidiary, dataOT_RegistrosRelacionados) {

            // Declarar variables
            let result = {};
            let data = [];

            // Filtro de subsidiary
            let array_where_subsidiary = ["subsidiary", "anyof", "@NONE@"];
            if (subsidiary != '') {
                array_where_subsidiary = ["subsidiary", "anyof", subsidiary];
            }

            // Filtro de ID Interno de registros relacionados
            let array_registros_relacionados_id_interno = ["internalid", "anyof", "@NONE@"];
            if (Object.keys(dataOT_RegistrosRelacionados).length > 0) {
                array_registros_relacionados_id_interno = ["internalid", "anyof"];
                dataOT_RegistrosRelacionados.forEach(element => {
                    array_registros_relacionados_id_interno.push(element.related_record_internal_id)
                });
            }
            // objHelper.error_log('', array_registros_relacionados_id_interno);

            // Declarar search
            let searchObject = {
                type: 'workorderissue',
                columns: [
                    search.createColumn({
                        name: "internalid",
                        join: "createdFrom",
                        label: "Created From : Work Order - Internal ID"
                    }),
                    search.createColumn({
                        name: "tranid",
                        join: "createdFrom",
                        label: "Created From : Work Order - Number"
                    }),
                    search.createColumn({ name: "internalid", label: "Work Order Issue - Internal ID" }),
                    search.createColumn({
                        name: "tranid",
                        sort: search.Sort.DESC,
                        label: "Work Order Issue - Number"
                    }),
                    search.createColumn({ name: "item", label: "Item" }),
                    search.createColumn({
                        name: "displayname",
                        join: "item",
                        label: "Display Name"
                    }),
                    search.createColumn({
                        name: "custitem3",
                        join: "item",
                        label: "Line"
                    }),
                    search.createColumn({ name: "quantity", label: "Quantity" }),
                    search.createColumn({ name: "unit", label: "Units" }),
                    search.createColumn({ name: "unitabbreviation", label: "Units Abbreviation" }),
                    search.createColumn({ name: "account", label: "Account" }),
                    search.createColumn({ name: "debitamount", label: "Amount (Debit)" }),
                    search.createColumn({ name: "creditamount", label: "Amount (Credit)" })
                ],
                filters: [
                    ["mainline", "any", ""],
                    "AND",
                    ["type", "anyof", "WOIssue"],
                    "AND",
                    array_where_subsidiary,
                    "AND",
                    array_registros_relacionados_id_interno,
                    "AND",
                    ["debitamount", "isnotempty", ""]
                ],
            };

            // Crear search
            let searchContext = search.create(searchObject);

            // Cantidad de registros en search
            // let count = searchContext.runPaged().count;
            // log.debug('', 'getDataOT_EmisionesOrdenesProduccion');
            // log.debug('', count);

            // Recorrer search - con mas de 4000 registros
            let pageData = searchContext.runPaged({ pageSize: 1000 }); // El minimo de registros que se puede traer por pagina es 50, pondremos 1000 para que en el caso existan 4500 registros, hayan 5 paginas como maximo y no me consuma mucha memoria

            pageData.pageRanges.forEach(function (pageRange) {
                var myPage = pageData.fetch({ index: pageRange.index });
                myPage.data.forEach((row) => {
                    // Obtener informacion
                    let { columns } = row;
                    let work_order_internal_id = row.getValue(columns[0]);
                    let work_order_number = row.getValue(columns[1]);
                    let work_order_issue_internal_id = row.getValue(columns[2]);
                    let work_order_issue_number = row.getValue(columns[3]);
                    let item = row.getValue(columns[4]);
                    let item_name = row.getText(columns[4]);
                    let displayname = row.getValue(columns[5]);
                    let line = row.getValue(columns[6]);
                    let line_name = row.getText(columns[6]);
                    let quantity = row.getValue(columns[7]);
                    let unit = row.getValue(columns[8]);
                    let unitabbreviation = row.getValue(columns[9]);
                    let account = row.getValue(columns[10]);
                    let account_name = row.getText(columns[10]);
                    let debitamount = row.getValue(columns[11]);

                    // Insertar informacion en array
                    data.push({
                        orden_trabajo_id_interno: work_order_internal_id,
                        orden_trabajo_numero: work_order_number,
                        emision_orden_produccion_id_interno: work_order_issue_internal_id,
                        emision_orden_produccion_numero: work_order_issue_number,
                        codigo: item,
                        codigo_nombre: item_name,
                        descripcion: displayname,
                        linea: line,
                        linea_nombre: line_name,
                        cantidad: quantity,
                        unidades: unit,
                        unidades_abreviacion: unitabbreviation,
                        cuenta: account,
                        cuenta_nombre: account_name,
                        importe_debito: debitamount,
                    });
                });
            });

            // Retornar informacion
            result = {
                data: data,
            }
            // log.debug('', 'getDataOT_EmisionesOrdenesProduccion');
            // log.debug('', result);
            // objHelper.error_log('getDataOT_EmisionesOrdenesProduccion', result);
            return result;
        }

        function getDataOT_DatosProduccion(subsidiary, dateFrom, dateTo, dataOT) {

            // Declarar variables
            let result = {};
            let data = [];

            // Filtro de ID Interno de Ordenes de Trabajo
            let id_interno = ["@NONE@"];
            if (Object.keys(dataOT).length > 0) {
                id_interno = [];
                dataOT.forEach(element => {
                    id_interno.push(element.id_interno)
                });
            }
            // objHelper.error_log('', id_interno);

            // Crear search
            let searchContext = search.create({
                type: "customrecord501",
                columns: [
                    search.createColumn({ name: "name", label: "Name" }),
                    search.createColumn({ name: "custrecord201", label: "Nombre de la operación" }),
                    search.createColumn({
                        name: "custrecord150",
                        sort: search.Sort.DESC,
                        label: "Orden de trabajo"
                    }),
                    search.createColumn({ name: "custrecord186", label: "Fecha" }),
                    search.createColumn({ name: "custrecord153", label: "Empleado " }),
                    search.createColumn({ name: "custrecord188", label: "Centro de Costo" }),
                    search.createColumn({ name: "custrecord197", label: "Tipo de Hora" }),
                    search.createColumn({ name: "custrecord202", label: "Categoría" }),
                    search.createColumn({ name: "custrecord198", label: "Servicios" }),
                    search.createColumn({ name: "custrecord194", label: "Duración (Horas)" }),
                    search.createColumn({ name: "custrecord187", label: "Costo x Hora" }),
                    search.createColumn({
                        name: "formulanumeric",
                        formula: "ROUND({custrecord194}*{custrecord187},2)",
                        label: "Costo Total"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        formula: "{custrecord194}*{custrecord187}",
                        label: "Costo Total (Sin redondear)"
                    })
                ],
                filters: [
                    search.createFilter({
                        name: 'custrecord150',
                        operator: search.Operator.ANYOF,
                        values: id_interno
                    })
                ],
            });

            // Cantidad de registros en search
            // let count = searchContext.runPaged().count;
            // log.debug('', 'getDataOT_DatosProduccion');
            // log.debug('', count);

            // Recorrer search - con mas de 4000 registros
            let pageData = searchContext.runPaged({ pageSize: 1000 }); // El minimo de registros que se puede traer por pagina es 50, pondremos 1000 para que en el caso existan 4500 registros, hayan 5 paginas como maximo y no me consuma mucha memoria

            pageData.pageRanges.forEach(function (pageRange) {
                var myPage = pageData.fetch({ index: pageRange.index });
                myPage.data.forEach((row) => {
                    // Obtener informacion
                    let { columns } = row;
                    let nombre = row.getValue(columns[0]);
                    let nombre_operacion = row.getValue(columns[1]);
                    let nombre_operacion_descripcion = row.getText(columns[1]);
                    let orden_trabajo = row.getValue(columns[2]);
                    let fecha = row.getValue(columns[3]);
                    let empleado = row.getValue(columns[4]);
                    let empleado_nombre = row.getText(columns[4]);
                    let centro_costo = row.getValue(columns[5]);
                    let centro_costo_nombre = row.getText(columns[5]);
                    let tipo_hora = row.getValue(columns[6]);
                    let tipo_hora_nombre = row.getText(columns[6]);
                    let categoria = row.getValue(columns[7]);
                    let categoria_nombre = row.getText(columns[7]);
                    let servicios = row.getValue(columns[8]);
                    let duracion_horas = row.getValue(columns[9]);
                    let costo_hora = row.getValue(columns[10]);
                    let costo_total = row.getValue(columns[12]);

                    // Insertar informacion en array
                    data.push({
                        nombre: nombre,
                        nombre_operacion: nombre_operacion,
                        nombre_operacion_descripcion: nombre_operacion_descripcion,
                        orden_trabajo: orden_trabajo,
                        fecha: fecha,
                        empleado: empleado,
                        empleado_nombre: empleado_nombre,
                        centro_costo: centro_costo,
                        centro_costo_nombre: centro_costo_nombre,
                        tipo_hora: tipo_hora,
                        tipo_hora_nombre: tipo_hora_nombre,
                        categoria: categoria,
                        categoria_nombre: categoria_nombre,
                        servicios: servicios,
                        duracion_horas: duracion_horas,
                        costo_hora: costo_hora,
                        costo_total: costo_total,
                    });
                });
            });

            // Retornar informacion
            result = {
                data: data,
            }
            // log.debug('', 'getDataOT_DatosProduccion');
            // log.debug('', result);
            // objHelper.error_log('getDataOT_DatosProduccion', result);
            return result;
        }

        function getDataConf_CentroCosto_Linea() {

            // Declarar variables
            let result = {};
            let data = [];

            // Declarar search
            let searchObject = {
                type: 'customrecord_bio_conf_cencos_lin',
                columns: [
                    search.createColumn({ name: "internalid", label: "ID INTERNO" }),
                    search.createColumn({ name: "custrecord_bio_centro_costo", label: "Centro Costo" }),
                    search.createColumn({ name: "custrecord_bio_linea", label: "Linea" })
                ],
                filters: [
                    search.createFilter({
                        name: 'isinactive',
                        operator: search.Operator.IS,
                        values: 'F' // F para registros activos
                    })
                ]
            };

            // Crear search
            let searchContext = search.create(searchObject);

            // Cantidad de registros en search
            // let count = searchContext.runPaged().count;
            // log.debug('', 'getRecordConfiguracion_CentroCosto_Linea');
            // log.debug('', count);

            // Recorrer search
            searchContext.run().each(node => {
                // Obtener informacion
                let columns = node.columns;
                let id_interno = node.getValue(columns[0]); // ID INTERNO
                let centro_costo = node.getValue(columns[1]); // ORDEN DE TRABAJO
                let centro_costo_nombre = node.getText(columns[1]); // ORDEN DE TRABAJO
                let linea = node.getValue(columns[2]); // LINEA
                let linea_nombre = node.getText(columns[2]); // LINEA

                // Insertar informacion en array
                data.push({
                    id_interno: id_interno,
                    centro_costo: centro_costo,
                    centro_costo_nombre: centro_costo_nombre,
                    linea: linea,
                    linea_nombre: linea_nombre,
                });
                return true; // La funcion each debes indicarle si quieres que siga iterando o no
            })

            // Retornar informacion
            result = {
                data: data
            }
            // log.debug('', 'getRecordConfiguracion_CentroCosto_Linea');
            // log.debug('', result);
            // objHelper.error_log('getRecordConfiguracion_CentroCosto_Linea', result);
            return result;
        }

        function getFilterLote(dataOTByFecha) {

            // Obtener lotes
            let data_lotes = [];
            dataOTByFecha.forEach(element => {
                data_lotes.push(element.lote);
            });
            // objHelper.error_log('', data_lotes);

            // Filtrar lotes duplicados
            // Referencia: https://matiashernandez.dev/blog/post/4-formas-de-eliminar-elementos-duplicados-en-un-arreglo-con-javascript
            let data_filter_lotes = [];
            const dataArr = new Set(data_lotes);
            data_filter_lotes = [...dataArr];
            // objHelper.error_log('', data_filter_lotes);

            // Filtro de lotes
            let array_where_lotes = [];
            data_filter_lotes.forEach(element => {
                array_where_lotes.push(['custbodybio_cam_lote', 'is', `${element}`])
                array_where_lotes.push('OR')
            });
            // objHelper.error_log('', array_where_lotes)

            // Eliminar ultimo elemento de un array
            // Referencia: https://forfrontend.tips/eliminar-elementos-de-un-array-en-javascript
            array_where_lotes.pop();
            // objHelper.error_log('', array_where_lotes)

            return array_where_lotes;
        }

        function getDataReporteGastos_Cuentas6168(subsidiary, anio, mes) {

            // Declarar variables
            let result = {};
            let data = [];

            // Filtro de subsidiary
            let array_where_subsidiary = ["subsidiary", "anyof", "@NONE@"];
            if (subsidiary != '') {
                array_where_subsidiary = ["subsidiary", "anyof", subsidiary];
            }

            // Período contable Nombre
            let array_mes = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
            anio = (anio < 10) ? `0${anio}` : `${anio}`;
            let periodo = `${array_mes[mes]} ${anio}`;
            // objHelper.error_log('', periodo);

            // Centro de Costo
            let centro_costo_array = ['8', '9', '10', '11', '12', '32', '13'];
            let centro_costo_nombre_array = ['PRODUCCIÓN : 2211 INYECTABLES', 'PRODUCCIÓN : 2221 SEMISOLIDOS', 'PRODUCCIÓN : 2231 LIQUIDOS', 'PRODUCCIÓN : 2241 SOLUCIONES TOPICAS', 'PRODUCCIÓN : 2251 SOLIDOS', 'PRODUCCIÓN : 2261 POLVOS', 'PRODUCCIÓN : 2271 ACONDICIONADO'];

            // Declarar search
            let searchObject = {
                type: "transaction",
                columns: [
                    search.createColumn({
                        name: "number",
                        join: "account",
                        sort: search.Sort.ASC,
                        label: "Cuenta : Número"
                    }),
                    search.createColumn({ name: "grossamount", label: "Importe (bruto)" }),
                    search.createColumn({
                        name: "internalid",
                        join: "class",
                        label: "Centro de Costo : ID interno"
                    }),
                    search.createColumn({
                        name: "name",
                        join: "class",
                        label: "Centro de Costo : Nombre"
                    }),
                    search.createColumn({
                        name: "periodname",
                        join: "accountingPeriod",
                        label: "Período contable : Nombre"
                    }),
                    search.createColumn({ name: "subsidiary", label: "Subsidiaria" }),
                ],
                filters: [
                    // Filtros por defecto
                    [
                        ["account.number", "startswith", "61"], "OR",
                        ["account.number", "startswith", "62131113"], "OR", // Eliminar todas las cuentas que comienzan con 62, excepto 62131113
                        ["account.number", "startswith", "63"], "OR",
                        ["account.number", "startswith", "64"], "OR",
                        ["account.number", "startswith", "65"], "OR",
                        ["account.number", "startswith", "66"], "OR",
                        ["account.number", "startswith", "68"], "OR",
                        ["account.number", "startswith", "60"]
                    ],
                    "AND",
                    ["account.number", "isnot", "60991111"],
                    "AND",
                    ["type", "noneof", "PurchOrd", "PurchReq"],
                    "AND",
                    ["formulatext: CASE\tWHEN TO_CHAR({number}) = 'Memorized' THEN '0'\tWHEN TO_CHAR({number}) = 'Memorizado' THEN '0'\tELSE '1'END", "is", "1"],

                    // Filtros adicionales
                    "AND",
                    array_where_subsidiary, // Subsidiaria a buscar
                    "AND",
                    ["accountingperiod.periodname", "startswith", periodo], // Período contable a buscar

                    // Filtros que realiza el Area Contable
                    // Centros de costo: 2211, 2221, 2231, 2241, 2251, 2261, 2271
                    // Eliminar todas las cuentas que comienzan con 62, excepto 62131113
                    // Eliminar toda la cuenta 63311115
                    "AND",
                    ["class.internalid", "anyof"].concat(centro_costo_array),
                    "AND",
                    ["account.number", "isnot", "63311115"]
                ],
            };

            // Crear search
            let searchContext = search.create(searchObject);

            // Cantidad de registros en search
            // let count = searchContext.runPaged().count;
            // log.debug('', 'getDataReporteGastos_Cuentas6168');
            // log.debug('', count);

            // Recorrer search - con mas de 4000 registros
            let pageData = searchContext.runPaged({ pageSize: 1000 }); // El minimo de registros que se puede traer por pagina es 50, pondremos 1000 para que en el caso existan 4500 registros, hayan 5 paginas como maximo y no me consuma mucha memoria

            pageData.pageRanges.forEach(function (pageRange) {
                var myPage = pageData.fetch({ index: pageRange.index });
                myPage.data.forEach((row) => {
                    // Obtener informacion
                    let { columns } = row;
                    let cuenta_numero = row.getValue(columns[0]);
                    let importe_bruto = row.getValue(columns[1]);
                    let centro_costo = row.getValue(columns[2]);
                    let centro_costo_nombre = row.getValue(columns[3]);
                    let periodo_contable_nombre = row.getValue(columns[4]);
                    let subsidiaria = row.getValue(columns[5]);

                    // Insertar informacion en array
                    data.push({
                        cuenta_numero: cuenta_numero,
                        importe_bruto: importe_bruto,
                        centro_costo: centro_costo,
                        centro_costo_nombre: centro_costo_nombre,
                        periodo_contable_nombre: periodo_contable_nombre,
                        subsidiaria: subsidiaria,
                    });
                });
            });

            // Retornar informacion
            result = {
                data: data,
            }
            // log.debug('', 'getDataReporteGastos_Cuentas6168');
            // log.debug('', result);
            // objHelper.error_log('getDataReporteGastos_Cuentas6168', result);
            return result;
        }

        return { getDataOTByFecha, getDataOTByLote, getDataRevaluacion, getDataOT_RegistrosRelacionados, getDataOT_EmisionesOrdenesProduccion, getDataOT_DatosProduccion, getDataConf_CentroCosto_Linea, getDataReporteGastos_Cuentas6168 }

    });
