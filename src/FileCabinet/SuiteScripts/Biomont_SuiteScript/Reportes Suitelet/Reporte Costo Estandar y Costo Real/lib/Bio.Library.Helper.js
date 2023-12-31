/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['N'],

    function (N) {

        const { runtime, email } = N;

        function getDate() {
            let today = new Date();
            let firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

            // Calcular el mes pasado, ajustando el año si es enero
            let yearOfMonthPast = today.getFullYear();
            let monthOfMonthPast = today.getMonth() - 1;

            // En JavaScript, los meses se representan con valores enteros del 0 al 11, donde 0 es enero y 11 es diciembre.
            if (monthOfMonthPast === -1) {
                // Si es enero, retrocede al mes pasado del año anterior
                yearOfMonthPast--;
                monthOfMonthPast = 11; // Diciembre
            }

            let firstDayOfMonthPast = new Date(yearOfMonthPast, monthOfMonthPast, 1);
            let lastDayOfMonthPast = new Date(today.getFullYear(), today.getMonth(), 0);

            return { today, firstDayOfMonth, firstDayOfMonthPast, lastDayOfMonthPast, yearOfMonthPast, monthOfMonthPast };
        }

        function getYear() {
            let result = [];
            let today = new Date();
            let year = today.getFullYear();

            for (let i = year - 2; i <= year + 2; i++) {
                result.push({
                    id: i,
                    name: i
                });
            }
            return result;
        }

        function getMonth() {
            let result = [];
            let value = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
            let text = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

            value.forEach((element, i) => {
                result.push({
                    id: value[i],
                    name: text[i],
                });
            });
            return result;
        }

        function getDatesByOT(dataReporte) {

            let fechas = [];

            dataReporte.forEach((value_rep, key_rep) => {

                let datos_de_produccion = value_rep.datos_de_produccion || [];
                datos_de_produccion.forEach((value_prod, key_prod) => {

                    // Obtener informacion
                    // Datos de Produccion
                    let fec_cierre = value_prod.fecha;
                    let anio = Number(fec_cierre.split('/')[2]);
                    let mes = Number(fec_cierre.split('/')[1]) - 1;

                    // Insertar informacion en array
                    fechas.push({ year: anio, month: mes });
                });
            });

            // Utilizamos un conjunto para almacenar objetos únicos
            let conjuntoFechas = new Set(fechas.map(JSON.stringify));

            // Convertimos el conjunto nuevamente en un array
            let fechasUnicas = Array.from(conjuntoFechas, JSON.parse);

            // Ordena el array por year y month y luego invierte el resultado
            fechasUnicas.sort((a, b) => a.year - b.year || a.month - b.month).reverse();

            // error_log('fechasUnicas', fechasUnicas);
            return fechasUnicas;
        }

        function getUser() {
            let user = runtime.getCurrentUser();
            return { user };
        }

        function error_log(title, data) {
            throw `${title} -- ${JSON.stringify(data)}`;
        }

        function error_log_by_lote(title, data, lotes = []) {
            let json = [];
            data.forEach(value_data => {
                lotes.forEach(value_lotes => {
                    if (value_data.lote == value_lotes) {
                        json.push(value_data);
                    }
                });
            });
            throw `${title} -- ${JSON.stringify(json)}`;
        }

        function email_log(title, data) {
            let user = runtime.getCurrentUser();
            email.send({
                author: user.id,
                recipients: user.id,
                subject: title,
                body: `<pre>${JSON.stringify(data)}</pre>`,
            })
        }

        function decimalAdjust(type, value, exp) {
            // Si el exp no está definido o es cero...
            if (typeof exp === 'undefined' || +exp === 0) {
                return Math[type](value);
            }
            value = +value;
            exp = +exp;
            // Si el valor no es un número o el exp no es un entero...
            if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
                return NaN;
            }
            // Shift
            value = value.toString().split('e');
            value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
            // Shift back
            value = value.toString().split('e');
            return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
        }

        // Decimal round
        if (!Math.round10) {
            Math.round10 = function (value, exp) {
                return decimalAdjust('round', value, exp);
            };
        }
        // Decimal floor
        if (!Math.floor10) {
            Math.floor10 = function (value, exp) {
                return decimalAdjust('floor', value, exp);
            };
        }
        // Decimal ceil
        if (!Math.ceil10) {
            Math.ceil10 = function (value, exp) {
                return decimalAdjust('ceil', value, exp);
            };
        }

        // Determinar si una string es numérico en JavaScript
        // Referencia: https://www.techiedelight.com/es/determine-string-numeric-javascript/
        function isNumeric(n) {
            return !isNaN(n);
        }

        return { getDate, getYear, getMonth, getDatesByOT, getUser, error_log, error_log_by_lote, email_log, isNumeric }

    });
