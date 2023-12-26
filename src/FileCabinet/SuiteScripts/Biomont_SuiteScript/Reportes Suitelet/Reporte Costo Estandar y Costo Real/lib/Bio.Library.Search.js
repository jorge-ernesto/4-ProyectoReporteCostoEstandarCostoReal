/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['./Bio.Library.Helper', 'N'],

    function (objHelper, N) {

        const { log, search } = N;

        function getDataOT(subsidiary, dateFrom, dateTo) {

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
                    search.createColumn({ name: "custbody126", label: "FECHA DE INICIO DE LA PRODUCCIÓN" }),
                    search.createColumn({ name: "enddate", label: "FECHA DE FINALIZACIÓN DE PRODUCCION" }),
                    search.createColumn({ name: "class", label: "CENTRO DE COSTO" }),
                    search.createColumn({ name: "item", label: "CÓDIGO ORACLE" }),
                    search.createColumn({
                        name: "salesdescription",
                        join: "item",
                        label: "DESCRIPCIÓN"
                    }),
                    search.createColumn({ name: "built", label: "CANTIDAD" }),
                    search.createColumn({
                        name: "custitem3",
                        join: "item",
                        label: "LINEA"
                    })
                ],
                filters: [
                    ["mainline", "is", "T"],
                    "AND",
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["trandate", "within", dateFrom, dateTo],
                    "AND",
                    ["status", "anyof", "WorkOrd:H"],
                    "AND",
                    ["item.custitem3", "anyof", "2", "6", "1", "3", "10", "11", "9", "48", "4"],
                    "AND",
                    array_where_subsidiary
                ],
            });

            // Cantidad de registros en search
            // let count = searchContext.runPaged().count;
            // log.debug('', 'getDataOT')
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
                let fec_ini_prod = node.getValue(columns[4]); // FECHA DE INICIO DE LA PRODUCCIÓN
                let fec_fin_prod = node.getValue(columns[5]); // FECHA DE FINALIZACIÓN DE PRODUCCION
                let centro_costo = node.getText(columns[6]); // CENTRO DE COSTO
                let codigo_oracle = node.getText(columns[7]); // CÓDIGO ORACLE
                let descripcion = node.getValue(columns[8]); // DESCRIPCIÓN
                let cantidad_construido = node.getValue(columns[9]); // CANTIDAD
                let linea = node.getValue(columns[10]); // LINEA
                let linea_nombre = node.getText(columns[10]); // LINEA

                // Insertar informacion en array
                data.push({
                    id_interno: id_interno,
                    orden_trabajo: orden_trabajo,
                    lote: lote,
                    tipo_orden_trabajo: tipo_orden_trabajo,
                    tipo_orden_trabajo_nombre: tipo_orden_trabajo_nombre,
                    fec_ini_prod: fec_ini_prod,
                    fec_fin_prod: fec_fin_prod,
                    centro_costo: centro_costo,
                    codigo_oracle: codigo_oracle,
                    descripcion: descripcion,
                    cantidad_construido: cantidad_construido,
                    linea: linea,
                    linea_nombre: linea_nombre,
                });
                return true; // La funcion each debes indicarle si quieres que siga iterando o no
            })

            // Retornar informacion
            result = {
                data: data
            }
            // log.debug('', 'getDataOT')
            // log.debug('', result);
            // objHelper.error_log('getDataOT', result);
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
                        label: "Memo"
                    }),
                    search.createColumn({
                        name: "location",
                        summary: "MAX",
                        label: "Location"
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
            // log.debug('', 'getDataRevaluacion')
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
            // log.debug('', 'getDataRevaluacion')
            // log.debug('', result)
            // objHelper.error_log('', result);
            return result;
        }

        function getDataOT_RegistrosRelacionados(subsidiary, dateFrom, dateTo) {

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
                type: 'workorder',
                columns: [
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
                    ["trandate", "within", dateFrom, dateTo],
                    "AND",
                    ["status", "anyof", "WorkOrd:H"],
                    "AND",
                    array_where_subsidiary,
                    "AND",
                    ["applyingtransaction.type", "anyof", "WOIssue"]
                ],
            });

            // Cantidad de registros en search
            // let count = searchContext.runPaged().count;
            // log.debug('', 'getDataOT_RegistrosRelacionados')
            // log.debug('', count);

            // Recorrer search
            searchContext.run().each(node => {
                // Obtener informacion
                let columns = node.columns;
                let orden_trabajo = node.getValue(columns[0]); // Nro OT
                // let lote = node.getValue(columns[1]); // Lote
                let related_record_date = node.getValue(columns[2]); // Related Records : DATE
                let related_record_type = node.getValue(columns[3]); // Related Records : TYPE
                let related_record_number = node.getValue(columns[4]); // Related Records : NUMBER

                // Insertar informacion en array
                data.push({
                    orden_trabajo: orden_trabajo,
                    // lote: lote,
                    related_record_date: related_record_date,
                    related_record_type: related_record_type,
                    related_record_number: related_record_number
                });
                return true; // La funcion each debes indicarle si quieres que siga iterando o no
            })

            // Retornar informacion
            result = {
                data: data,
            }
            // log.debug('', 'getDataOT_RegistrosRelacionados')
            // log.debug('', result)
            // objHelper.error_log('getDataOT_RegistrosRelacionados', result);
            return result;
        }

        function getDataOT_EmisionesOrdenesProduccion(subsidiary, dataOT_RegistrosRelacionados) {

            // Obtener los ID de registros relacionados
            let array_registros_relacionados = [];
            dataOT_RegistrosRelacionados.forEach(element => {
                array_registros_relacionados.push(parseInt(element.related_record_number))
            });
            let min_reg_rel = Math.min(...array_registros_relacionados);
            let max_reg_rel = Math.max(...array_registros_relacionados);
            // objHelper.error_log('getDataOT_EmisionesOrdenesProduccion', array_registros_relacionados);

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
                type: 'workorderissue',
                columns: [
                    search.createColumn({
                        name: "tranid",
                        join: "createdFrom",
                        label: "Work Order"
                    }),
                    search.createColumn({
                        name: "tranid",
                        sort: search.Sort.DESC,
                        label: "Work Order Issue"
                    }),
                    search.createColumn({ name: "item", label: "Item" }),
                    search.createColumn({
                        name: "custitem3",
                        join: "item",
                        label: "Line"
                    }),
                    search.createColumn({ name: "quantity", label: "Quantity" }),
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
                    ["number", "between", min_reg_rel, max_reg_rel],
                    "AND",
                    ["debitamount", "isnotempty", ""]
                ],
            });

            // Cantidad de registros en search
            // let count = searchContext.runPaged().count;
            // log.debug('', 'getDataOT_EmisionesOrdenesProduccion')
            // log.debug('', count);

            // Recorrer search - con mas de 4000 registros
            let pageData = searchContext.runPaged({ pageSize: 1000 }); // El minimo de registros que se puede traer por pagina es 50, pondremos 1000 para que en el caso existan 4500 registros, hayan 5 paginas como maximo y no me consuma mucha memoria

            pageData.pageRanges.forEach(function (pageRange) {
                var myPage = pageData.fetch({ index: pageRange.index });
                myPage.data.forEach((row) => {
                    // Obtener informacion
                    let { columns } = row;
                    let work_order = row.getValue(columns[0]);
                    let work_order_issue = row.getValue(columns[1]);
                    let item = row.getValue(columns[2]);
                    let item_name = row.getText(columns[2]);
                    let line = row.getValue(columns[3]);
                    let line_name = row.getText(columns[3]);
                    let quantity = row.getValue(columns[4]);
                    let account = row.getValue(columns[5]);
                    let account_name = row.getText(columns[5]);
                    let debitamount = row.getValue(columns[6]);

                    // Insertar informacion en array
                    data.push({
                        orden_trabajo: work_order,
                        emision_orden_produccion: work_order_issue,
                        codigo: item,
                        codigo_nombre: item_name,
                        linea: line,
                        linea_nombre: line_name,
                        cantidad: quantity,
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
            // log.debug('', 'getDataOT_EmisionesOrdenesProduccion')
            // log.debug('', result)
            // objHelper.error_log('getDataOT_EmisionesOrdenesProduccion', result);
            return result;
        }

        function getDataOT_DatosProduccion(subsidiary, dateFrom, dateTo, dataOT) {

            // Obtener los ID Interno de las Ordenes de Trabajo
            let id_interno = [];
            dataOT.forEach(element => {
                id_interno.push(element.id_interno)
            });
            // objHelper.error_log('', id_interno);

            // Declarar variables
            let result = {};
            let data = [];

            // Crear search
            let searchContext = search.create({
                type: "customrecord501",
                columns: [
                    search.createColumn({ name: "name", label: "Name" }),
                    search.createColumn({ name: "custrecord201", label: "Nombre de la operación" }),
                    search.createColumn({
                        name: "custrecord150",
                        sort: search.Sort.ASC,
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
            // log.debug('', 'getDataOT_DatosProduccion')
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
                    let costo_total = row.getValue(columns[11]);

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
            // log.debug('', 'getDataOT_DatosProduccion')
            // log.debug('', result)
            // objHelper.error_log('getDataOT_DatosProduccion', result);
            return result;
        }

        return { getDataOT, getDataRevaluacion, getDataOT_RegistrosRelacionados, getDataOT_EmisionesOrdenesProduccion, getDataOT_DatosProduccion }

    });
