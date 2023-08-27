/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['./Bio.Library.Helper', 'N'],

    function (objHelper, N) {

        function agruparRevaluacion(dataRevaluacion) {

            // JSON donde guardaremos la informacion
            let data = {
                'items': {}
            };

            // Recorrer data
            dataRevaluacion.forEach(element => {
                // Obtener valor por el que agrupar
                const key = element.item;

                // Si no existe indice en JSON
                data['items'][key] = data['items'][key] || [];

                // Insertar infromacion en JSON
                data['items'][key].push(element);
            });

            // Retornar informacion
            return data;
        }

        function getDataOT_Completo(dataOT, dataRevaluacion, dataOT_RegistrosRelacionados, dataOT_EmisionesOrdenesProduccion, dataOT_DatosProduccion) {

            // objHelper.error_log('getDataOT_Completo', [dataOT, dataRevaluacion, dataOT_RegistrosRelacionados, dataOT_EmisionesOrdenesProduccion, dataOT_DatosProduccion])

            let calcular_costo_real_md = true;
            let calcular_costo_real_mod_srv = true;
            let eliminar_datos = true;

            // --- OBTENER COSTO REAL MD (MP, MV, ME) ---
            if (calcular_costo_real_md) {
                // RECORRER ORDENES DE TRABAJO PARA AGREGAR -- REVALUACIONES DE INVENTARIO
                let dataRevaluacion_ = agruparRevaluacion(dataRevaluacion);

                dataOT.forEach((value_ot, key_ot) => {
                    // Convertir string vacio '' a 0
                    // Referencia: https://donnierock.com/2015/06/16/javascript-devolver-0-cuando-parseint-o-parsefloat-reciban-una-cadena-vacia/
                    let codigo_oracle = value_ot.codigo_oracle
                    dataOT[key_ot]['fec_cos_est'] = dataRevaluacion_['items'][codigo_oracle][0]['trandate'];
                    dataOT[key_ot]['costo_estandar_md'] = parseFloat(dataRevaluacion_['items'][codigo_oracle][0]['costo_estandar_md'] || 0);
                    dataOT[key_ot]['costo_estandar_mod'] = parseFloat(dataRevaluacion_['items'][codigo_oracle][0]['costo_estandar_mod'] || 0);
                    dataOT[key_ot]['costo_estandar_srv'] = parseFloat(dataRevaluacion_['items'][codigo_oracle][0]['costo_estandar_srv'] || 0);
                    dataOT[key_ot]['costo_estandar_cif'] = parseFloat(dataRevaluacion_['items'][codigo_oracle][0]['costo_estandar_cif'] || 0);
                    dataOT[key_ot]['costo_estandar_total'] = parseFloat(dataRevaluacion_['items'][codigo_oracle][0]['costcomponentstandardcost'] || 0);
                });

                // RECORRER LOS REGISTROS RELACIONADOS (EMISIONES DE ORDENES DE PRODUCCION) DE LAS ORDENES DE TRABAJO PARA AGREGAR -- LA INFORMACION DE IMPACTO EN LM
                dataOT_RegistrosRelacionados.forEach((value_regrel, key_regrel) => {
                    dataOT_EmisionesOrdenesProduccion.forEach((value_emi, key_emi) => {
                        if (value_regrel.related_record_number == value_emi.emision_orden_produccion_numero) {
                            dataOT_RegistrosRelacionados[key_regrel]['impacto_en_lm'] = dataOT_RegistrosRelacionados[key_regrel]['impacto_en_lm'] || [];
                            dataOT_RegistrosRelacionados[key_regrel]['impacto_en_lm'].push(value_emi)
                        }
                    });
                });

                // RECORRER ORDENES DE TRABAJO PARA AGREGAR -- REGISTROS RELACIONADOS (EMISIONES DE ORDENES DE PRODUCCION)
                dataOT.forEach((value_ot, key_ot) => {
                    dataOT_RegistrosRelacionados.forEach((value_regrel, key_regrel) => {
                        if (value_ot.orden_trabajo == value_regrel.orden_trabajo_numero) {
                            dataOT[key_ot]['registros_relacionados'] = dataOT[key_ot]['registros_relacionados'] || [];
                            dataOT[key_ot]['registros_relacionados'].push(value_regrel)
                        }
                    })
                });

                // RECORRER ORDENES DE TRABAJO (TIPO DE ORDEN DE TRABAJO: FABRICACION) PARA OBTENER:
                let total_mp;
                dataOT.forEach((value_ot, key_ot) => {
                    if (value_ot.tipo_orden_trabajo == '1' || value_ot.tipo_orden_trabajo_nombre == 'FABRICACIÓN') {
                        total_mp = 0;

                        let registros_relacionados = value_ot.registros_relacionados || [];
                        registros_relacionados.forEach((value_regrel, key_regrel) => {

                            let impacto_en_lm = value_regrel.impacto_en_lm || [];
                            impacto_en_lm.forEach((value_lm, key_lm) => {

                                total_mp += parseFloat(value_lm.importe_debito)
                            });
                        });
                    }

                    // TOTAL SOLES MP (MATERIA PRIMA)
                    if (value_ot.tipo_orden_trabajo == '1' || value_ot.tipo_orden_trabajo_nombre == 'FABRICACIÓN') {
                        dataOT[key_ot]['total_mp'] = parseFloat(total_mp)
                    }
                });

                // RECORRER ORDENES DE TRABAJO (TIPO DE ORDEN DE TRABAJO: ENVASADO Y EMPACADO) PARA OBTENER:
                let dataOT_MP = dataOT;
                dataOT.forEach((value_ot, key_ot) => {
                    if (value_ot.tipo_orden_trabajo == '3' || value_ot.tipo_orden_trabajo_nombre == 'ENVASADO Y EMPACADO') {

                        dataOT_MP.forEach((value_ot_mp, key_ot_mp) => {
                            if (value_ot.lote == value_ot_mp.lote && (value_ot_mp.tipo_orden_trabajo == '1' || value_ot_mp.tipo_orden_trabajo_nombre == 'FABRICACIÓN')) {

                                // TOTAL SOLES MP (MATERIA PRIMA)
                                dataOT[key_ot]['total_mp'] = parseFloat(value_ot_mp.total_mp);
                            }
                        });
                    }
                });

                // RECORRER ORDENES DE TRABAJO (TIPO DE ORDEN DE TRABAJO: ENVASADO Y EMPACADO) PARA OBTENER:
                dataOT.forEach((value_ot, key_ot) => {
                    if (value_ot.tipo_orden_trabajo == '3' || value_ot.tipo_orden_trabajo_nombre == 'ENVASADO Y EMPACADO') {

                        // TOTAL USADO EN ORDEN
                        dataOT[key_ot]['total_usado_en_orden'] = parseFloat(value_ot.cantidad_teorica) * parseFloat(value_ot.volumen);
                    }
                });

                // RECORRER ORDENES DE TRABAJO (TIPO DE ORDEN DE TRABAJO: ENVASADO Y EMPACADO) PARA OBTENER:
                let dataOT_MVME = dataOT;
                let total_usado_en_ordenes = 0;
                dataOT.forEach((value_ot, key_ot) => {
                    if (value_ot.tipo_orden_trabajo == '3' || value_ot.tipo_orden_trabajo_nombre == 'ENVASADO Y EMPACADO') {
                        total_usado_en_ordenes = 0;

                        dataOT_MVME.forEach((value_ot_mvme, key_ot_mvme) => {
                            if (value_ot.lote == value_ot_mvme.lote && (value_ot_mvme.tipo_orden_trabajo == '3' || value_ot_mvme.tipo_orden_trabajo_nombre == 'ENVASADO Y EMPACADO')) {

                                total_usado_en_ordenes += parseFloat(value_ot_mvme.total_usado_en_orden);
                            }
                        });
                    }

                    // TOTAL USADO EN ORDENES
                    if (value_ot.tipo_orden_trabajo == '3' || value_ot.tipo_orden_trabajo_nombre == 'ENVASADO Y EMPACADO') {
                        dataOT[key_ot]['total_usado_en_ordenes'] = parseFloat(total_usado_en_ordenes);
                    }
                });

                // RECORRER ORDENES DE TRABAJO (TIPO DE ORDEN DE TRABAJO: ENVASADO Y EMPACADO) PARA OBTENER:
                let total_mv_me;
                dataOT.forEach((value_ot, key_ot) => {
                    if (value_ot.tipo_orden_trabajo == '3' || value_ot.tipo_orden_trabajo_nombre == 'ENVASADO Y EMPACADO') {
                        total_mv_me = 0;

                        let registros_relacionados = value_ot.registros_relacionados || [];
                        registros_relacionados.forEach((value_regrel, key_regrel) => {

                            let impacto_en_lm = value_regrel.impacto_en_lm || [];
                            impacto_en_lm.forEach((value_lm, key_lm) => {

                                if (!(value_lm.linea == '6' || value_lm.linea_nombre == 'BULK Y PRODUCTOS INTERMEDIOS')) {
                                    total_mv_me += parseFloat(value_lm.importe_debito)
                                }
                            });
                        });
                    }

                    // TOTAL SOLES MV ME (MATERIAL ENVASE Y MATERIAL EMPAQUE)
                    // FACTOR
                    // TOTAL SOLES BULK UTILIZADA
                    // TOTAL MD (MATERIAL DIRECTO: MP + MV + ME)
                    // COSTO REAL MD (MATERIAL DIRECTO: MP + MV + ME)
                    if (value_ot.tipo_orden_trabajo == '3' || value_ot.tipo_orden_trabajo_nombre == 'ENVASADO Y EMPACADO') {
                        dataOT[key_ot]['total_mv_me'] = parseFloat(total_mv_me);
                        dataOT[key_ot]['factor'] = parseFloat(value_ot.total_usado_en_orden) / parseFloat(value_ot.total_usado_en_ordenes);
                        dataOT[key_ot]['total_bulk_utilizada'] = parseFloat(value_ot.total_mp) * parseFloat(dataOT[key_ot]['factor']);
                        dataOT[key_ot]['total_md'] = dataOT[key_ot]['total_bulk_utilizada'] + dataOT[key_ot]['total_mv_me'];
                        dataOT[key_ot]['costo_real_md'] = dataOT[key_ot]['total_md'] / parseFloat(value_ot.cantidad_construido);
                    }
                });
            }

            // --- OBTENER COSTO REAL MOD y SRV ---
            if (calcular_costo_real_mod_srv) {
                // RECORRER ORDENES DE TRABAJO PARA AGREGAR -- DATOS DE PRODUCCION
                dataOT.forEach((value_ot, key_ot) => {
                    dataOT_DatosProduccion.forEach((value_prod, key_prod) => {
                        if (value_ot.id_interno == value_prod.orden_trabajo) {
                            dataOT[key_ot]['datos_de_produccion'] = dataOT[key_ot]['datos_de_produccion'] || [];
                            dataOT[key_ot]['datos_de_produccion'].push(value_prod)
                        }
                    })
                });

                // RECORRER ORDENES DE TRABAJO (TIPO DE ORDEN DE TRABAJO: FABRICACION) PARA OBTENER:
                let total_mod_mp;
                dataOT.forEach((value_ot, key_ot) => {
                    if (value_ot.tipo_orden_trabajo == '1' || value_ot.tipo_orden_trabajo_nombre == 'FABRICACIÓN') {
                        total_mod_mp = 0;

                        let datos_de_produccion = value_ot.datos_de_produccion || [];
                        datos_de_produccion.forEach((value_prod, key_prod) => {

                            total_mod_mp += parseFloat(value_prod.costo_total || 0)
                        });
                    }

                    // TOTAL SOLES MOD MP (MATERIA PRIMA)
                    if (value_ot.tipo_orden_trabajo == '1' || value_ot.tipo_orden_trabajo_nombre == 'FABRICACIÓN') {
                        dataOT[key_ot]['total_mod_mp'] = parseFloat(total_mod_mp)
                    }
                });

                // RECORRER ORDENES DE TRABAJO (TIPO DE ORDEN DE TRABAJO: ENVASADO Y EMPACADO) PARA OBTENER:
                let dataOT_MP = dataOT;
                dataOT.forEach((value_ot, key_ot) => {
                    if (value_ot.tipo_orden_trabajo == '3' || value_ot.tipo_orden_trabajo_nombre == 'ENVASADO Y EMPACADO') {

                        dataOT_MP.forEach((value_ot_mp, key_ot_mp) => {
                            if (value_ot.lote == value_ot_mp.lote && (value_ot_mp.tipo_orden_trabajo == '1' || value_ot_mp.tipo_orden_trabajo_nombre == 'FABRICACIÓN')) {

                                // TOTAL SOLES MOD MP (MATERIA PRIMA)
                                dataOT[key_ot]['total_mod_mp'] = parseFloat(value_ot_mp.total_mod_mp);
                            }
                        });
                    }
                });

                // RECORRER ORDENES DE TRABAJO (TIPO DE ORDEN DE TRABAJO: ENVASADO Y EMPACADO) PARA OBTENER:
                let total_mod_mv_me;
                let total_srv;
                dataOT.forEach((value_ot, key_ot) => {
                    if (value_ot.tipo_orden_trabajo == '3' || value_ot.tipo_orden_trabajo_nombre == 'ENVASADO Y EMPACADO') {
                        total_mod_mv_me = 0;
                        total_srv = 0;

                        let datos_de_produccion = value_ot.datos_de_produccion || [];
                        datos_de_produccion.forEach((value_prod, key_prod) => {

                            if (!(value_prod.empleado == '22099' || value_prod.empleado_nombre == 'PERSONAL TERCERO')) {
                                total_mod_mv_me += parseFloat(value_prod.costo_total || 0)
                            }
                            if (value_prod.empleado == '22099' || value_prod.empleado_nombre == 'PERSONAL TERCERO') {
                                total_srv += parseFloat(value_prod.costo_total || 0)
                            }
                        });
                    }

                    // TOTAL SOLES MV ME (MATERIAL ENVASE Y MATERIAL EMPAQUE)
                    // TOTAL SOLES SRV (SERVICIOS)
                    // FACTOR
                    // TOTAL SOLES BULK UTILIZADA
                    // TOTAL MOD (MANO DE OBRA DIRECTA: MP + MV + ME)

                    // COSTO REAL MOD (MANO DE OBRA DIRECTA: MP + MV + ME)
                    // COSTO REAL SRV
                    // COSTO REAL CIF
                    // COSTO REAL TOTAL
                    if (value_ot.tipo_orden_trabajo == '3' || value_ot.tipo_orden_trabajo_nombre == 'ENVASADO Y EMPACADO') {
                        dataOT[key_ot]['total_mod_mv_me'] = parseFloat(total_mod_mv_me);
                        dataOT[key_ot]['total_srv'] = parseFloat(total_srv);
                        dataOT[key_ot]['total_mod_bulk_utilizada'] = parseFloat(value_ot.total_mod_mp) * parseFloat(value_ot.factor);
                        dataOT[key_ot]['total_mod'] = dataOT[key_ot]['total_mod_bulk_utilizada'] + dataOT[key_ot]['total_mod_mv_me'];

                        dataOT[key_ot]['costo_real_mod'] = parseFloat(dataOT[key_ot]['total_mod']) / parseFloat(value_ot.cantidad_construido);
                        dataOT[key_ot]['costo_real_srv'] = parseFloat(dataOT[key_ot]['total_srv']) / parseFloat(value_ot.cantidad_construido);
                        dataOT[key_ot]['costo_real_cif'] = parseFloat(value_ot.costo_estandar_cif);
                        dataOT[key_ot]['costo_real_total'] = parseFloat(value_ot.costo_real_md || 0) + parseFloat(dataOT[key_ot]['costo_real_mod'] || 0) + parseFloat(dataOT[key_ot]['costo_real_srv'] || 0) + parseFloat(dataOT[key_ot]['costo_estandar_cif'] || 0);
                    }
                });
            }

            // --- ELIMINAR DATOS ---
            if (eliminar_datos) {
                dataOT.forEach((value_ot, key_ot) => {
                    dataOT[key_ot]['datos_de_produccion'] = []
                });
            }

            // objHelper.error_log('getDataOT_Completo', dataOT);
            return dataOT;
        }

        function getReporte_CSV_Excel(dataOT_Completo) {
            let fDecimal = 6;

            // Declarar variables
            let dataReporte = [];

            dataOT_Completo.forEach((element, i) => {
                let json = {};
                // ORDEN DE TRABAJO
                json.orden_trabajo = element.orden_trabajo;
                json.lote = element.lote;
                json.tipo_orden_trabajo_nombre = element.tipo_orden_trabajo_nombre;
                json.estado = element.estado;
                json.fec_ini_prod = element.fec_ini_prod;
                json.fec_fin_prod = element.fec_fin_prod;
                json.fec_cos_est = element.fec_cos_est;
                json.centro_costo = element.centro_costo;
                json.codigo_oracle = element.codigo_oracle;
                json.descripcion = element.descripcion;
                json.cantidad_construido = element.cantidad_construido;
                let costo_total = element.cantidad_construido * Math.round10(element.costo_real_total, -fDecimal);
                json.costo_total = isNaN(costo_total) ? '' : Math.round10(costo_total, -fDecimal).toFixed(fDecimal);

                // COSTO ESTANDAR
                json.costo_estandar_md = isNaN(element.costo_estandar_md) ? '' : Math.round10(element.costo_estandar_md, -fDecimal).toFixed(fDecimal);
                json.costo_estandar_mod = isNaN(element.costo_estandar_mod) ? '' : Math.round10(element.costo_estandar_mod, -fDecimal).toFixed(fDecimal);
                json.costo_estandar_srv = isNaN(element.costo_estandar_srv) ? '' : Math.round10(element.costo_estandar_srv, -fDecimal).toFixed(fDecimal);
                json.costo_estandar_cif = isNaN(element.costo_estandar_cif) ? '' : Math.round10(element.costo_estandar_cif, -fDecimal).toFixed(fDecimal);
                json.costo_estandar_total = isNaN(element.costo_estandar_total) ? '' : Math.round10(element.costo_estandar_total, -fDecimal).toFixed(fDecimal);

                // COSTO REAL
                json.costo_real_md = isNaN(element.costo_real_md) ? '' : Math.round10(element.costo_real_md, -fDecimal).toFixed(fDecimal);
                json.costo_real_mod = isNaN(element.costo_real_mod) ? '' : Math.round10(element.costo_real_mod, -fDecimal).toFixed(fDecimal);
                json.costo_real_srv = isNaN(element.costo_real_srv) ? '' : Math.round10(element.costo_real_srv, -fDecimal).toFixed(fDecimal);
                json.costo_real_cif = isNaN(element.costo_real_cif) ? '' : Math.round10(element.costo_real_cif, -fDecimal).toFixed(fDecimal);
                json.costo_real_total = isNaN(element.costo_real_total) ? '' : Math.round10(element.costo_real_total, -fDecimal).toFixed(fDecimal);

                // DIFERENCIA SOLES
                let dif_md = Math.round10(element.costo_estandar_md, -fDecimal) - Math.round10(element.costo_real_md, -fDecimal);
                let dif_mod = Math.round10(element.costo_estandar_mod, -fDecimal) - Math.round10(element.costo_real_mod, -fDecimal);
                let dif_srv = Math.round10(element.costo_estandar_srv, -fDecimal) - Math.round10(element.costo_real_srv, -fDecimal);
                let dif_cif = Math.round10(element.costo_estandar_cif, -fDecimal) - Math.round10(element.costo_real_cif, -fDecimal);
                let dif_total = Math.round10(element.costo_estandar_total, -fDecimal) - Math.round10(element.costo_real_total, -fDecimal);
                json.dif_md = isNaN(dif_md) ? '' : Math.round10(dif_md, -fDecimal).toFixed(fDecimal);
                json.dif_mod = isNaN(dif_mod) ? '' : Math.round10(dif_mod, -fDecimal).toFixed(fDecimal);
                json.dif_srv = isNaN(dif_srv) ? '' : Math.round10(dif_srv, -fDecimal).toFixed(fDecimal);
                json.dif_cif = isNaN(dif_cif) ? '' : Math.round10(dif_cif, -fDecimal).toFixed(fDecimal);
                json.dif_total = isNaN(dif_total) ? '' : Math.round10(dif_total, -fDecimal).toFixed(fDecimal);

                // DIFERENCIA %
                let dif_md_ = (dif_md / Math.round10(element.costo_real_md, -fDecimal)) * 100;
                let dif_mod_ = (dif_mod / Math.round10(element.costo_real_mod, -fDecimal)) * 100;
                let dif_srv_ = (dif_srv / Math.round10(element.costo_real_srv, -fDecimal)) * 100;
                let dif_cif_ = (dif_cif / Math.round10(element.costo_real_cif, -fDecimal)) * 100;
                let dif_total_ = (dif_total / Math.round10(element.costo_real_total, -fDecimal)) * 100;
                json.dif_md_ = isNaN(dif_md_) ? '' : `${Math.round10(dif_md_, -2).toFixed(2)}%`;
                json.dif_mod_ = isNaN(dif_mod_) ? '' : `${Math.round10(dif_mod_, -2).toFixed(2)}%`;
                json.dif_srv_ = isNaN(dif_srv_) ? '' : `${Math.round10(dif_srv_, -2).toFixed(2)}%`;
                json.dif_cif_ = isNaN(dif_cif_) ? '' : `${Math.round10(dif_cif_, -2).toFixed(2)}%`;
                json.dif_total_ = isNaN(dif_total_) ? '' : `${Math.round10(dif_total_, -2).toFixed(2)}%`;

                dataReporte.push(json);
            });

            // objHelper.error_log('getReporte_CSV_Excel', dataReporte);
            return dataReporte;
        }

        return { agruparRevaluacion, getDataOT_Completo, getReporte_CSV_Excel }

    });
