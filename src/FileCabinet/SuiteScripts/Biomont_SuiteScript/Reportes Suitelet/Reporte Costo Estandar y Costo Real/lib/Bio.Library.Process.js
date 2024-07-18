/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['./Bio.Library.Helper', 'N'],

    function (objHelper, N) {

        function agruparRevaluacion(dataRevaluacion) {

            // Obtener revaluacion en formato agrupado por articulo
            let data = { // * Audit: Util, manejo de JSON
                'items': {}
            };

            dataRevaluacion.forEach(element => {

                // Obtener variables
                let item = element.item;

                // Agrupar revaluaciones por articulo
                data['items'][item] = data['items'][item] || []; // * Audit, manejo de Array
                data['items'][item].push(element);
            });

            return data;
        }

        function getDataOT_Completo(dataOT, dataRevaluacion, dataOT_RegistrosRelacionados, dataOT_EmisionesOrdenesProduccion, dataOT_DatosProduccion, dataConf_CentroCosto_Linea) {

            // objHelper.error_log('getDataOT_Completo', [dataOT, dataRevaluacion, dataOT_RegistrosRelacionados, dataOT_EmisionesOrdenesProduccion, dataOT_DatosProduccion])

            let calcular_costo_real_md = true;
            let calcular_costo_real_mod_srv = true;
            let calcular_costo_cif = true;

            /****************** OBTENER COSTO REAL MD (MP, MV, ME) ******************/
            if (calcular_costo_real_md) {
                // RECORRER ORDENES DE TRABAJO -- PARA AGREGAR REVALUACIONES DE INVENTARIO
                let dataRevaluacion_ = agruparRevaluacion(dataRevaluacion);

                dataOT.forEach((value_ot, key_ot) => {
                    // Convertir string vacio '' a 0
                    // Referencia: https://donnierock.com/2015/06/16/javascript-devolver-0-cuando-parseint-o-parsefloat-reciban-una-cadena-vacia/
                    let codigo_oracle = value_ot.codigo_oracle
                    if (dataRevaluacion_['items'][codigo_oracle]) {
                        dataOT[key_ot]['fec_cos_est'] = dataRevaluacion_['items'][codigo_oracle][0]['trandate'] || '';
                        dataOT[key_ot]['costo_estandar_md'] = parseFloat(dataRevaluacion_['items'][codigo_oracle][0]['costo_estandar_md'] || 0);
                        dataOT[key_ot]['costo_estandar_mod'] = parseFloat(dataRevaluacion_['items'][codigo_oracle][0]['costo_estandar_mod'] || 0);
                        dataOT[key_ot]['costo_estandar_srv'] = parseFloat(dataRevaluacion_['items'][codigo_oracle][0]['costo_estandar_srv'] || 0);
                        dataOT[key_ot]['costo_estandar_cif'] = parseFloat(dataRevaluacion_['items'][codigo_oracle][0]['costo_estandar_cif'] || 0);
                        dataOT[key_ot]['costo_estandar_total'] = parseFloat(dataRevaluacion_['items'][codigo_oracle][0]['costcomponentstandardcost'] || 0);
                    } else {
                        dataOT[key_ot]['fec_cos_est'] = '';
                        dataOT[key_ot]['costo_estandar_md'] = 0;
                        dataOT[key_ot]['costo_estandar_mod'] = 0;
                        dataOT[key_ot]['costo_estandar_srv'] = 0;
                        dataOT[key_ot]['costo_estandar_cif'] = 0;
                        dataOT[key_ot]['costo_estandar_total'] = 0;
                    }
                });

                // RECORRER LOS REGISTROS RELACIONADOS (EMISIONES DE ORDENES DE PRODUCCION) DE LAS ORDENES DE TRABAJO -- PARA AGREGAR LA INFORMACION DE IMPACTO EN LM
                dataOT_RegistrosRelacionados.forEach((value_regrel, key_regrel) => {
                    dataOT_EmisionesOrdenesProduccion.forEach((value_emi, key_emi) => {
                        if (value_regrel.related_record_number == value_emi.emision_orden_produccion_numero && value_regrel.related_record_typecode == 'WOIssue') {
                            dataOT_RegistrosRelacionados[key_regrel]['impacto_en_lm'] = dataOT_RegistrosRelacionados[key_regrel]['impacto_en_lm'] || [];
                            dataOT_RegistrosRelacionados[key_regrel]['impacto_en_lm'].push(value_emi)
                        }
                    });
                });

                // RECORRER ORDENES DE TRABAJO -- PARA AGREGAR REGISTROS RELACIONADOS (EMISIONES DE ORDENES DE PRODUCCION)
                dataOT.forEach((value_ot, key_ot) => {
                    dataOT_RegistrosRelacionados.forEach((value_regrel, key_regrel) => {
                        if (value_ot.orden_trabajo == value_regrel.orden_trabajo_numero && value_regrel.related_record_typecode == 'WOIssue') {
                            dataOT[key_ot]['registros_relacionados'] = dataOT[key_ot]['registros_relacionados'] || [];
                            dataOT[key_ot]['registros_relacionados'].push(value_regrel)
                        }
                    });
                });

                // RECORRER ORDENES DE TRABAJO -- PARA AGREGAR REGISTROS RELACIONADOS (FECHA DE CIERRE DE ORDEN DE PRODUCCION)
                dataOT.forEach((value_ot, key_ot) => {
                    dataOT_RegistrosRelacionados.forEach((value_regrel, key_regrel) => {
                        if (value_ot.orden_trabajo == value_regrel.orden_trabajo_numero && value_regrel.related_record_typecode == 'WOClose') {
                            dataOT[key_ot]['fec_cie_prod'] = value_regrel.related_record_date;
                        }
                    });
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

                        // RECORRER ORDENES DE TRABAJO (TIPO DE ORDEN DE TRABAJO: FABRICACION)
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

                        // RECORRER ORDENES DE TRABAJO (TIPO DE ORDEN DE TRABAJO: ENVASADO Y EMPACADO)
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

            /****************** OBTENER COSTO REAL MOD y SRV ******************/
            if (calcular_costo_real_mod_srv) {
                // RECORRER ORDENES DE TRABAJO -- PARA AGREGAR DATOS DE PRODUCCION
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

                        // RECORRER ORDENES DE TRABAJO (TIPO DE ORDEN DE TRABAJO: FABRICACION)
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
                        dataOT[key_ot]['costo_real_cif'] = 0;
                        dataOT[key_ot]['costo_real_total'] = parseFloat(value_ot.costo_real_md || 0) + parseFloat(dataOT[key_ot]['costo_real_mod'] || 0) + parseFloat(dataOT[key_ot]['costo_real_srv'] || 0) + parseFloat(dataOT[key_ot]['costo_real_cif'] || 0);
                    }
                });
            }

            /****************** ELIMINAR DATOS ******************/
            if (false) {
                dataOT.forEach((value_ot, key_ot) => {
                    dataOT[key_ot]['datos_de_produccion'] = []
                });
            }

            /****************** OBTENER COSTO REAL CIF ******************/
            if (calcular_costo_cif) {
                // RECORRER ORDENES DE TRABAJO -- PARA AGREGAR LINEA DE ORDEN DE TRABAJO (TIPO DE ORDEN DE TRABAJO: ENVASADO Y EMPACADO)
                dataOT.forEach((value_ot, key_ot) => {
                    dataConf_CentroCosto_Linea.forEach((value_conf, key_conf) => {

                        if (value_ot.tipo_orden_trabajo == '1' || value_ot.tipo_orden_trabajo_nombre == 'FABRICACIÓN' ||
                            value_ot.tipo_orden_trabajo == '3' || value_ot.tipo_orden_trabajo_nombre == 'ENVASADO Y EMPACADO') {

                            if (value_ot['ensamblaje_centro_costo'] == value_conf['centro_costo']) {
                                dataOT[key_ot]['linea_ot_envasado_empacado'] = value_conf['linea'];
                                dataOT[key_ot]['linea_nombre_ot_envasado_empacado'] = value_conf['linea_nombre'];
                            }
                        }
                    });
                });
            }

            if (!calcular_costo_cif) {
                // RECORRER ORDENES DE TRABAJO -- PARA AGREGAR LINEA DE ORDEN DE TRABAJO (TIPO DE ORDEN DE TRABAJO: ENVASADO Y EMPACADO)
                let dataReporte = dataOT;
                let dataReporte_ = dataOT;
                dataReporte.forEach((value_rep, key_rep) => {
                    // SI ES TIPO DE ORDEN DE TRABAJO: FABRICACION -- ASIGNA LINEA DE TIPO DE ORDEN DE TRABAJO: ENVASADO Y EMPACADO
                    if (value_rep.tipo_orden_trabajo == '1' || value_rep.tipo_orden_trabajo_nombre == 'FABRICACIÓN') {

                        dataReporte_.forEach((value_rep_, key_rep_) => {
                            if (value_rep.lote == value_rep_.lote && (value_rep_.tipo_orden_trabajo == '3' || value_rep_.tipo_orden_trabajo_nombre == 'ENVASADO Y EMPACADO')) {

                                dataReporte[key_rep]['linea_ot_envasado_empacado'] = value_rep_.linea;
                                dataReporte[key_rep]['linea_nombre_ot_envasado_empacado'] = value_rep_.linea_nombre;
                            }
                        });

                        // VALIDACION ADICIONAL POR EL CASO DE LA OT: 002386 CON LOTE: 083433
                        // SI ES TIPO DE ORDEN DE TRABAJO: FABRICACION, Y TIENE LINEA: PRODUCTOS INTERMEDIOS POLVOS
                        if (value_rep.linea == '48' || value_rep.linea_nombre == 'PRODUCTO INTERMEDIO POLVOS') {
                            dataReporte[key_rep]['linea_ot_envasado_empacado'] = '2';
                            dataReporte[key_rep]['linea_nombre_ot_envasado_empacado'] = 'POLVOS';
                        }
                    // SI ES TIPO DE ORDEN DE TRABAJO: ENVASADO Y EMPACADO -- ASIGNA SU PROPIA LINEA
                    } else if (value_rep.tipo_orden_trabajo == '3' || value_rep.tipo_orden_trabajo_nombre == 'ENVASADO Y EMPACADO') { // PODRIA AGREGARSE 4 - REACONDICIONADO

                        dataReporte[key_rep]['linea_ot_envasado_empacado'] = value_rep.linea;
                        dataReporte[key_rep]['linea_nombre_ot_envasado_empacado'] = value_rep.linea_nombre;

                        // VALIDACION ADICIONAL POR EL CASO DE LA OT: 002285 CON LOTE: 083153
                        // SI ES TIPO DE ORDEN DE TRABAJO: ENVASADO Y EMPACADO, Y TIENE LINEA: BULK Y PRODUCTOS INTERMEDIOS (SI TIENE LINEA: BULK Y PRODUCTOS INTERMEDIOS, DEBE SER TIPO DE ORDEN DE TRABAJO: FABRICACION, POR LO QUE ESTE CASO ES UN ERROR DE REGISTRO EN UNA OT)
                        if (value_rep.linea == '6' || value_rep.linea_nombre == 'BULK Y PRODUCTOS INTERMEDIOS') {

                            dataReporte_.forEach((value_rep_, key_rep_) => {
                                if (value_rep.lote == value_rep_.lote && !(value_rep_.linea == '6' || value_rep_.linea_nombre == 'BULK Y PRODUCTOS INTERMEDIOS')) {

                                    dataReporte[key_rep]['linea_ot_envasado_empacado'] = value_rep_.linea;
                                    dataReporte[key_rep]['linea_nombre_ot_envasado_empacado'] = value_rep_.linea_nombre;
                                }
                            });
                        }
                    }
                });
                dataOT = dataReporte;
            }

            // objHelper.error_log('getDataOT_Completo', dataOT);
            return dataOT;
        }

        function getFactorCIFbyMonth(dataReporte, dataReporteGastos_Cuentas6168, parameters = {}) {

            let calcular_costo_cif = true;

            /****************** OBTENER COSTO REAL CIF ******************/
            if (calcular_costo_cif) {
                // RECORRER ORDENES DE TRABAJARO PARA OBTENER:
                let dataFactorCIF = {};
                dataFactorCIF['total_hr_iny'] = 0;
                dataFactorCIF['total_hr_sem'] = 0;
                dataFactorCIF['total_hr_liq'] = 0;
                dataFactorCIF['total_hr_sot'] = 0;
                dataFactorCIF['total_hr_sol'] = 0;
                dataFactorCIF['total_hr_pol'] = 0;
                dataFactorCIF['total_hr_aco'] = 0;

                dataReporte.forEach((value_rep, key_rep) => {

                    let datos_de_produccion = value_rep.datos_de_produccion || [];
                    datos_de_produccion.forEach((value_prod, key_prod) => {

                        // Obtener informacion
                        // Orden de Trabajo
                        let lin_id = value_rep.linea_ot_envasado_empacado;
                        let lin = value_rep.linea_nombre_ot_envasado_empacado;
                        // Datos de Produccion
                        let horas = value_prod.duracion_horas;
                        let fec_cierre = value_prod.fecha;
                        let anio = fec_cierre.split('/')[2];
                        let mes = fec_cierre.split('/')[1];
                        let estado = value_rep.estado;

                        // Validar parametros para filtrar datos - para obtener factor CIF por año y mes
                        if (Object.keys(parameters).length > 0) {

                            // Filtrar por Fecha de Cierre y Estado
                            // En JavaScript, los meses se representan con valores enteros del 0 al 11, donde 0 es enero y 11 es diciembre.
                            if (Number(anio) == Number(parameters.anio) && Number(mes) == Number(parameters.mes) + 1 && ['Cerrada', 'Closed', 'En curso', 'In Process', 'Liberada', 'Released'].includes(estado)) {

                                // Filtrar por Linea
                                if (['1', '9', '3', '10', '11', '2'].includes(lin_id) || ['INYECTABLES', 'SEMISOLIDOS', 'LIQUIDOS', 'SOLUCIONES TOPICAS', 'SOLIDOS', 'POLVOS'].includes(lin)) {

                                    if (lin == 'INYECTABLES') {
                                        dataFactorCIF['total_hr_iny'] += parseFloat(horas) || 0;
                                    } else if (lin == 'SEMISOLIDOS') {
                                        dataFactorCIF['total_hr_sem'] += parseFloat(horas) || 0;
                                    } else if (lin == 'LIQUIDOS') {
                                        dataFactorCIF['total_hr_liq'] += parseFloat(horas) || 0;
                                    } else if (lin == 'SOLUCIONES TOPICAS') {
                                        dataFactorCIF['total_hr_sot'] += parseFloat(horas) || 0;
                                    } else if (lin == 'SOLIDOS') {
                                        dataFactorCIF['total_hr_sol'] += parseFloat(horas) || 0;
                                    } else if (lin == 'POLVOS') {
                                        dataFactorCIF['total_hr_pol'] += parseFloat(horas) || 0;
                                    }
                                    dataFactorCIF['total_hr_aco'] += parseFloat(horas) || 0;
                                }
                            }
                        }
                    });
                });

                /******************/

                // RECORRER REPORTE DE GASTOS PARA OBTENER:
                dataFactorCIF['total_cc_iny'] = 0;
                dataFactorCIF['total_cc_sem'] = 0;
                dataFactorCIF['total_cc_liq'] = 0;
                dataFactorCIF['total_cc_sot'] = 0;
                dataFactorCIF['total_cc_sol'] = 0;
                dataFactorCIF['total_cc_pol'] = 0;
                dataFactorCIF['total_cc_aco'] = 0;

                dataFactorCIF['factor_cif_iny'] = 0;
                dataFactorCIF['factor_cif_sem'] = 0;
                dataFactorCIF['factor_cif_liq'] = 0;
                dataFactorCIF['factor_cif_sot'] = 0;
                dataFactorCIF['factor_cif_sol'] = 0;
                dataFactorCIF['factor_cif_pol'] = 0;
                dataFactorCIF['factor_cif_aco'] = 0;

                dataReporteGastos_Cuentas6168.forEach((value_rep, key_rep) => {

                    let cuenta_numero = value_rep.cuenta_numero;
                    let importe_bruto = value_rep.importe_bruto;
                    let centro_costo = value_rep.centro_costo;
                    let centro_costo_nombre = value_rep.centro_costo_nombre;

                    // Centro de Costo
                    let centro_costo_array = ['8', '9', '10', '11', '12', '32', '13'];
                    let centro_costo_nombre_array = ['PRODUCCIÓN : 2211 INYECTABLES', 'PRODUCCIÓN : 2221 SEMISOLIDOS', 'PRODUCCIÓN : 2231 LIQUIDOS', 'PRODUCCIÓN : 2241 SOLUCIONES TOPICAS', 'PRODUCCIÓN : 2251 SOLIDOS', 'PRODUCCIÓN : 2261 POLVOS', 'PRODUCCIÓN : 2271 ACONDICIONADO'];

                    // Centros de costo: 2211, 2221, 2231, 2241, 2251, 2261, 2271
                    if (centro_costo_array.includes(centro_costo) || centro_costo_nombre_array.includes(centro_costo_nombre)) {

                        // Eliminar todas las cuentas que comienzan con 62, excepto 62131113
                        if (cuenta_numero.substring(0, 2) != '62' || cuenta_numero == '62131113') {

                            // Eliminar toda la cuenta 63311115
                            if (cuenta_numero != '63311115') {

                                if (centro_costo == '8' || centro_costo_nombre == 'PRODUCCIÓN : 2211 INYECTABLES') {
                                    dataFactorCIF['total_cc_iny'] += parseFloat(importe_bruto) || 0;
                                } else if (centro_costo == '9' || centro_costo_nombre == 'PRODUCCIÓN : 2221 SEMISOLIDOS') {
                                    dataFactorCIF['total_cc_sem'] += parseFloat(importe_bruto) || 0;
                                } else if (centro_costo == '10' || centro_costo_nombre == 'PRODUCCIÓN : 2231 LIQUIDOS') {
                                    dataFactorCIF['total_cc_liq'] += parseFloat(importe_bruto) || 0;
                                } else if (centro_costo == '11' || centro_costo_nombre == 'PRODUCCIÓN : 2241 SOLUCIONES TOPICAS') {
                                    dataFactorCIF['total_cc_sot'] += parseFloat(importe_bruto) || 0;
                                } else if (centro_costo == '12' || centro_costo_nombre == 'PRODUCCIÓN : 2251 SOLIDOS') {
                                    dataFactorCIF['total_cc_sol'] += parseFloat(importe_bruto) || 0;
                                } else if (centro_costo == '32' || centro_costo_nombre == 'PRODUCCIÓN : 2261 POLVOS') {
                                    dataFactorCIF['total_cc_pol'] += parseFloat(importe_bruto) || 0;
                                } else if (centro_costo == '13' || centro_costo_nombre == 'PRODUCCIÓN : 2271 ACONDICIONADO') {
                                    dataFactorCIF['total_cc_aco'] += parseFloat(importe_bruto) || 0;
                                }
                            }
                        }
                    }
                });

                // Calcular Factor CIF
                dataFactorCIF['factor_cif_iny'] = dataFactorCIF['total_hr_iny'] == 0 ? 0 : dataFactorCIF['total_cc_iny'] / dataFactorCIF['total_hr_iny'];
                dataFactorCIF['factor_cif_sem'] = dataFactorCIF['total_hr_sem'] == 0 ? 0 : dataFactorCIF['total_cc_sem'] / dataFactorCIF['total_hr_sem'];
                dataFactorCIF['factor_cif_liq'] = dataFactorCIF['total_hr_liq'] == 0 ? 0 : dataFactorCIF['total_cc_liq'] / dataFactorCIF['total_hr_liq'];
                dataFactorCIF['factor_cif_sot'] = dataFactorCIF['total_hr_sot'] == 0 ? 0 : dataFactorCIF['total_cc_sot'] / dataFactorCIF['total_hr_sot'];
                dataFactorCIF['factor_cif_sol'] = dataFactorCIF['total_hr_sol'] == 0 ? 0 : dataFactorCIF['total_cc_sol'] / dataFactorCIF['total_hr_sol'];
                dataFactorCIF['factor_cif_pol'] = dataFactorCIF['total_hr_pol'] == 0 ? 0 : dataFactorCIF['total_cc_pol'] / dataFactorCIF['total_hr_pol'];
                dataFactorCIF['factor_cif_aco'] = dataFactorCIF['total_hr_aco'] == 0 ? 0 : dataFactorCIF['total_cc_aco'] / dataFactorCIF['total_hr_aco'];

                return dataFactorCIF;
            }
        }

        function asignarFactorCIFByOTs(dataReporte, dataFactorCIF) {

            let calcular_costo_cif = true;

            /****************** OBTENER COSTO REAL CIF ******************/
            if (calcular_costo_cif) {
                dataReporte.forEach((value_rep, key_rep) => {

                    let datos_de_produccion = value_rep.datos_de_produccion || [];
                    datos_de_produccion.forEach((value_prod, key_prod) => {

                        dataReporte[key_rep]['datos_de_produccion'][key_prod]['factor_cif_iny'] = 0;
                        dataReporte[key_rep]['datos_de_produccion'][key_prod]['factor_cif_sem'] = 0;
                        dataReporte[key_rep]['datos_de_produccion'][key_prod]['factor_cif_liq'] = 0;
                        dataReporte[key_rep]['datos_de_produccion'][key_prod]['factor_cif_sot'] = 0;
                        dataReporte[key_rep]['datos_de_produccion'][key_prod]['factor_cif_sol'] = 0;
                        dataReporte[key_rep]['datos_de_produccion'][key_prod]['factor_cif_pol'] = 0;
                        dataReporte[key_rep]['datos_de_produccion'][key_prod]['factor_cif_aco'] = 0;

                        // Obtener informacion
                        // Orden de Trabajo
                        let lin_id = value_rep.linea_ot_envasado_empacado;
                        let lin = value_rep.linea_nombre_ot_envasado_empacado;
                        // Datos de Produccion
                        let fec_cierre = value_prod.fecha;
                        let anio = fec_cierre.split('/')[2];
                        let mes = fec_cierre.split('/')[1];

                        // Filtrar por Linea
                        // En JavaScript, los meses se representan con valores enteros del 0 al 11, donde 0 es enero y 11 es diciembre.
                        if (['1', '9', '3', '10', '11', '2'].includes(lin_id) || ['INYECTABLES', 'SEMISOLIDOS', 'LIQUIDOS', 'SOLUCIONES TOPICAS', 'SOLIDOS', 'POLVOS'].includes(lin)) {

                            anio = Number(anio);
                            mes = Number(mes) - 1;

                            if (dataFactorCIF[anio]) {
                                if (dataFactorCIF[anio][mes]) {

                                    if (lin == 'INYECTABLES') {
                                        dataReporte[key_rep]['datos_de_produccion'][key_prod]['factor_cif_iny'] = parseFloat(dataFactorCIF[anio][mes].factor_cif_iny) || 0;
                                    } else if (lin == 'SEMISOLIDOS') {
                                        dataReporte[key_rep]['datos_de_produccion'][key_prod]['factor_cif_sem'] = parseFloat(dataFactorCIF[anio][mes].factor_cif_sem) || 0;
                                    } else if (lin == 'LIQUIDOS') {
                                        dataReporte[key_rep]['datos_de_produccion'][key_prod]['factor_cif_liq'] = parseFloat(dataFactorCIF[anio][mes].factor_cif_liq) || 0;
                                    } else if (lin == 'SOLUCIONES TOPICAS') {
                                        dataReporte[key_rep]['datos_de_produccion'][key_prod]['factor_cif_sot'] = parseFloat(dataFactorCIF[anio][mes].factor_cif_sot) || 0;
                                    } else if (lin == 'SOLIDOS') {
                                        dataReporte[key_rep]['datos_de_produccion'][key_prod]['factor_cif_sol'] = parseFloat(dataFactorCIF[anio][mes].factor_cif_sol) || 0;
                                    } else if (lin == 'POLVOS') {
                                        dataReporte[key_rep]['datos_de_produccion'][key_prod]['factor_cif_pol'] = parseFloat(dataFactorCIF[anio][mes].factor_cif_pol) || 0;
                                    }
                                    dataReporte[key_rep]['datos_de_produccion'][key_prod]['factor_cif_aco'] = parseFloat(dataFactorCIF[anio][mes].factor_cif_aco) || 0;
                                }
                            }
                        }
                    });
                });

                dataReporte.forEach((value_rep, key_rep) => {

                    let total_cif_ot = 0;

                    let datos_de_produccion = value_rep.datos_de_produccion || [];
                    datos_de_produccion.forEach((value_prod, key_prod) => {

                        // Datos CIF
                        let total_iny = (parseFloat(value_prod.duracion_horas) || 0) * (parseFloat(value_prod.factor_cif_iny) || 0);
                        let total_sem = (parseFloat(value_prod.duracion_horas) || 0) * (parseFloat(value_prod.factor_cif_sem) || 0);
                        let total_liq = (parseFloat(value_prod.duracion_horas) || 0) * (parseFloat(value_prod.factor_cif_liq) || 0);
                        let total_sot = (parseFloat(value_prod.duracion_horas) || 0) * (parseFloat(value_prod.factor_cif_sot) || 0);
                        let total_sol = (parseFloat(value_prod.duracion_horas) || 0) * (parseFloat(value_prod.factor_cif_sol) || 0);
                        let total_pol = (parseFloat(value_prod.duracion_horas) || 0) * (parseFloat(value_prod.factor_cif_pol) || 0);
                        let total_aco = (parseFloat(value_prod.duracion_horas) || 0) * (parseFloat(value_prod.factor_cif_aco) || 0);
                        let total_gen = total_iny + total_sem + total_liq + total_sot + total_sol + total_pol + total_aco;

                        dataReporte[key_rep]['datos_de_produccion'][key_prod]['total_iny'] = total_iny;
                        dataReporte[key_rep]['datos_de_produccion'][key_prod]['total_sem'] = total_sem;
                        dataReporte[key_rep]['datos_de_produccion'][key_prod]['total_liq'] = total_liq;
                        dataReporte[key_rep]['datos_de_produccion'][key_prod]['total_sot'] = total_sot;
                        dataReporte[key_rep]['datos_de_produccion'][key_prod]['total_sol'] = total_sol;
                        dataReporte[key_rep]['datos_de_produccion'][key_prod]['total_pol'] = total_pol;
                        dataReporte[key_rep]['datos_de_produccion'][key_prod]['total_aco'] = total_aco;
                        dataReporte[key_rep]['datos_de_produccion'][key_prod]['total_gen'] = total_gen;

                        total_cif_ot += total_gen;
                    });

                    // Total CIF de la OT
                    dataReporte[key_rep]['total_gen_cif_ot'] = total_cif_ot;
                });

                // RECORRER ORDENES DE TRABAJO (TIPO DE ORDEN DE TRABAJO: ENVASADO Y EMPACADO) PARA OBTENER:
                let dataReporte_bulk = dataReporte;
                dataReporte.forEach((value_rep, key_rep) => {
                    if (value_rep.tipo_orden_trabajo == '3' || value_rep.tipo_orden_trabajo_nombre == 'ENVASADO Y EMPACADO') {

                        // RECORRER ORDENES DE TRABAJO (TIPO DE ORDEN DE TRABAJO: FABRICACION)
                        dataReporte_bulk.forEach((value_rep_bulk, key_rep_bulk) => {
                            if (value_rep.lote == value_rep_bulk.lote && (value_rep_bulk.tipo_orden_trabajo == '1' || value_rep_bulk.tipo_orden_trabajo_nombre == 'FABRICACIÓN')) {

                                // TOTAL SOLES CIF BULK
                                // BULK = MP (MATERIA PRIMA)
                                dataReporte[key_rep]['total_gen_cif_ot_bulk'] = parseFloat(value_rep_bulk.total_gen_cif_ot);
                            }
                        });
                    }
                });

                // RECORRER ORDENES DE TRABAJO (TIPO DE ORDEN DE TRABAJO: ENVASADO Y EMPACADO) PARA OBTENER:
                dataReporte.forEach((value_rep, key_rep) => {
                    if (value_rep.tipo_orden_trabajo == '3' || value_rep.tipo_orden_trabajo_nombre == 'ENVASADO Y EMPACADO') {

                        // TOTAL CIF BULK UTILIZADA
                        // TOTAL CIF
                        // COSTO REAL CIF
                        // COSTO REAL TOTAL
                        dataReporte[key_rep]['total_gen_cif_ot_bulk_utilizada'] = parseFloat(value_rep.total_gen_cif_ot_bulk) * parseFloat(value_rep.factor);
                        dataReporte[key_rep]['total_cif'] = parseFloat(dataReporte[key_rep]['total_gen_cif_ot']) + parseFloat(dataReporte[key_rep]['total_gen_cif_ot_bulk_utilizada']);
                        dataReporte[key_rep]['costo_real_cif'] = dataReporte[key_rep]['total_cif'] / parseFloat(value_rep.cantidad_construido);
                        dataReporte[key_rep]['costo_real_total'] = parseFloat(value_rep.costo_real_md || 0) + parseFloat(value_rep.costo_real_mod || 0) + parseFloat(value_rep.costo_real_srv || 0) + parseFloat(dataReporte[key_rep]['costo_real_cif'] || 0);
                    }
                });

                return dataReporte;
            }
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
                json.fec = element.fec;
                json.fec_ini_prod = element.fec_ini_prod;
                json.fec_fin_prod = element.fec_fin_prod;
                json.fec_cie_prod = element.fec_cie_prod;
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

        return { agruparRevaluacion, getDataOT_Completo, getFactorCIFbyMonth, asignarFactorCIFByOTs, getReporte_CSV_Excel }

    });
