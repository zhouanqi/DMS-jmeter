/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 95.34883720930233, "KoPercent": 4.651162790697675};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9465116279069767, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.25, 500, 1500, "提交采购订单"], "isController": false}, {"data": [1.0, 500, 1500, "保存零数据采购退货"], "isController": false}, {"data": [1.0, 500, 1500, "刷新主表，获取operadata"], "isController": false}, {"data": [0.9, 500, 1500, "保存采购订单"], "isController": false}, {"data": [1.0, 500, 1500, "采购退货提交"], "isController": false}, {"data": [0.9, 500, 1500, "采购退货保存"], "isController": false}, {"data": [0.6, 500, 1500, "保存采购订单（添加商品）"], "isController": false}, {"data": [1.0, 500, 1500, "保存退货订单（添加商品）"], "isController": false}, {"data": [1.0, 500, 1500, "dms_login"], "isController": false}, {"data": [1.0, 500, 1500, "获取订单明细"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 215, 10, 4.651162790697675, 122.79534883720919, 12, 1299, 268.80000000000007, 336.5999999999999, 968.6400000000003, 11.871893981225842, 126.81259922004418, 9.815720337520707], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["提交采购订单", 10, 7, 70.0, 279.3, 60, 888, 835.5000000000002, 888.0, 888.0, 4.393673110720563, 3.3712001592706504, 8.581821864015819], "isController": false}, {"data": ["保存零数据采购退货", 10, 0, 0.0, 132.90000000000003, 69, 326, 310.30000000000007, 326.0, 326.0, 4.739336492890995, 6.414765995260664, 3.2536655805687205], "isController": false}, {"data": ["刷新主表，获取operadata", 70, 0, 0.0, 110.24285714285712, 66, 335, 212.19999999999993, 281.0, 335.0, 4.901274331326145, 140.12126551340847, 2.4773042553563926], "isController": false}, {"data": ["保存采购订单", 10, 1, 10.0, 142.10000000000002, 84, 188, 187.4, 188.0, 188.0, 4.595588235294118, 5.928488338694852, 10.13811896829044], "isController": false}, {"data": ["采购退货提交", 10, 0, 0.0, 187.6, 98, 487, 462.80000000000007, 487.0, 487.0, 1.9569471624266144, 2.484405577299413, 2.3773850293542074], "isController": false}, {"data": ["采购退货保存", 10, 0, 0.0, 426.09999999999997, 85, 1299, 1267.5, 1299.0, 1299.0, 1.9615535504119261, 0.9482119213417026, 3.091745537465673], "isController": false}, {"data": ["保存采购订单（添加商品）", 5, 2, 40.0, 143.0, 48, 371, 371.0, 371.0, 371.0, 1.2303149606299213, 1.259631059301181, 2.129502183809055], "isController": false}, {"data": ["保存退货订单（添加商品）", 10, 0, 0.0, 163.29999999999998, 77, 468, 453.00000000000006, 468.0, 468.0, 2.3158869847151458, 2.9219980314960634, 3.7988236017832335], "isController": false}, {"data": ["dms_login", 10, 0, 0.0, 247.6, 222, 317, 311.70000000000005, 317.0, 317.0, 4.486316733961417, 75.31316593764019, 3.4825909881112604], "isController": false}, {"data": ["获取订单明细", 70, 0, 0.0, 31.142857142857135, 12, 287, 41.8, 111.70000000000024, 287.0, 4.943851966946818, 4.104611024789886, 2.3443293576523763], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain \/{&quot;errCode&quot;:&quot;S&quot;\/", 7, 70.0, 3.255813953488372], "isController": false}, {"data": ["Test failed: text expected to contain \/&quot;errCode&quot;:&quot;S&quot;,&quot;errMsg&quot;:null\/", 3, 30.0, 1.3953488372093024], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 215, 10, "Test failed: text expected to contain \/{&quot;errCode&quot;:&quot;S&quot;\/", 7, "Test failed: text expected to contain \/&quot;errCode&quot;:&quot;S&quot;,&quot;errMsg&quot;:null\/", 3, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["提交采购订单", 10, 7, "Test failed: text expected to contain \/{&quot;errCode&quot;:&quot;S&quot;\/", 7, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["保存采购订单", 10, 1, "Test failed: text expected to contain \/&quot;errCode&quot;:&quot;S&quot;,&quot;errMsg&quot;:null\/", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["保存采购订单（添加商品）", 5, 2, "Test failed: text expected to contain \/&quot;errCode&quot;:&quot;S&quot;,&quot;errMsg&quot;:null\/", 2, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
