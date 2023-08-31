<!--
    <#assign a = "Hola Mundo">
    ${a}
-->
<!-- Evaluamos contenido de input.data, eval convierte un dato string a JSON -->
<#assign params = input.data?eval>
<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook
    xmlns="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:x="urn:schemas-microsoft-com:office:excel"
    xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:html="http://www.w3.org/TR/REC-html40">
    <!-- Estilos -->
    <ss:Styles>
        <ss:Style ss:ID="t1">
            <ss:Alignment ss:Horizontal="Right" />
            <ss:Font ss:Bold="1" />
            <Borders>
                <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FFFFFF" />
                <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FFFFFF" />
                <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DCDCDC" />
                <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FFFFFF" />
            </Borders>
        </ss:Style>
        <ss:Style ss:ID="header">
            <ss:Font ss:Bold="1" />
            <Borders>
                <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DCDCDC" />
                <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DCDCDC" />
                <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DCDCDC" />
                <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DCDCDC" />
            </Borders>
        </ss:Style>
        <ss:Style ss:ID="background">
            <Alignment ss:Horizontal="Right" ss:Vertical="Bottom" />
            <Borders>
                <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FFFFFF" />
                <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FFFFFF" />
                <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FFFFFF" />
                <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FFFFFF" />
            </Borders>
        </ss:Style>
        <ss:Style ss:ID="cell">
            <Borders>
                <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DCDCDC" />
                <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DCDCDC" />
                <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DCDCDC" />
                <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DCDCDC" />
            </Borders>
        </ss:Style>
    </ss:Styles>
    <!-- Hoja Excel -->
    <Worksheet ss:Name="Reporte Comparativo">
        <Table ss:StyleID="background">
            <!-- Definimos el tamaño de las columnas -->
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Column ss:Width="90" />
            <Row> <!-- Fila -->
                <Cell ss:StyleID="t1">
                    <Data ss:Type="String">Reporte</Data>
                </Cell>
                <Cell ss:StyleID="cell" ss:MergeAcross="1">
                    <Data ss:Type="String">${params.name}</Data>
                </Cell>
            </Row>
            <Row> <!-- Fila -->
                <Cell ss:StyleID="t1">
                    <Data ss:Type="String">Desde</Data>
                </Cell>
                <Cell ss:StyleID="cell" ss:MergeAcross="1">
                    <Data ss:Type="String">${params.dateFrom}</Data>
                </Cell>
            </Row>
            <Row> <!-- Fila -->
                <Cell ss:StyleID="t1">
                    <Data ss:Type="String">Hasta</Data>
                </Cell>
                <Cell ss:StyleID="cell" ss:MergeAcross="1">
                    <Data ss:Type="String">${params.dateTo}</Data>
                </Cell>
            </Row>
            <Row></Row> <!-- Fila -->
            <Row> <!-- Fila -->
                <!-- ORDEN DE TRABAJO -->
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">ORDEN DE TRABAJO </Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">LOTE</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">TIPO DE ORDEN DE TRABAJO</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">ESTADO</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">FECHA</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">FECHA DE INICIO DE LA PRODUCCION</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">FECHA DE FINALIZACION DE PRODUCCION</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">FECHA DE CIERRE DE PRODUCCION</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">FECHA DE COSTO ESTANDAR</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">CENTRO DE COSTO</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">CODIGO ORACLE</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">DESCRIPCION</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">CANTIDAD</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">COSTO TOTAL</Data>
                </Cell>
                <!-- COSTO ESTANDAR -->
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">COSTO EST MD</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">COSTO EST MOD</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">COSTO EST SRV</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">COSTO EST CIF</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">COSTO EST C.U.</Data>
                </Cell>
                <!-- COSTO REAL -->
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">COSTO REAL MD</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">COSTO REAL MOD</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">COSTO REAL SRV</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">COSTO REAL CIF</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">COSTO REAL C.U.</Data>
                </Cell>
                <!-- DIFERENCIA SOLES -->
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">DIF S/. MD</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">DIF S/. MOD</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">DIF S/. SRV</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">DIF S/. CIF</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">DIF S/. C.U.</Data>
                </Cell>
                <!-- DIFERENCIA % -->
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">DIF % MD</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">DIF % MOD</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">DIF % SRV</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">DIF % CIF</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">DIF % C.U.</Data>
                </Cell>
            </Row>
            <#list params.transactions as line>
            <Row> <!-- Fila -->
                <!-- ORDEN DE TRABAJO -->
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.orden_trabajo}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.lote}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.tipo_orden_trabajo_nombre}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.estado}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.fec}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.fec_ini_prod}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.fec_fin_prod}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.fec_cie_prod}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.fec_cos_est}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.centro_costo}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.codigo_oracle}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.descripcion}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.cantidad_construido}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.costo_total}</Data>
                </Cell>
                <!-- COSTO ESTANDAR -->
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.costo_estandar_md}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.costo_estandar_mod}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.costo_estandar_srv}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.costo_estandar_cif}</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">${line.costo_estandar_total}</Data>
                </Cell>
                <!-- COSTO REAL -->
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.costo_real_md}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.costo_real_mod}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.costo_real_srv}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.costo_real_cif}</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">${line.costo_real_total}</Data>
                </Cell>
                <!-- DIFERENCIA SOLES -->
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.dif_md}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.dif_mod}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.dif_srv}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.dif_cif}</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">${line.dif_total}</Data>
                </Cell>
                <!-- DIFERENCIA % -->
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.dif_md_}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.dif_mod_}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.dif_srv_}</Data>
                </Cell>
                <Cell ss:StyleID="cell">
                    <Data ss:Type="String">${line.dif_cif_}</Data>
                </Cell>
                <Cell ss:StyleID="header">
                    <Data ss:Type="String">${line.dif_total_}</Data>
                </Cell>
            </Row>
            </#list>
        </Table>
    </Worksheet>
</Workbook>