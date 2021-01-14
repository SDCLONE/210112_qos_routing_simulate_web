moduleInit();

function moduleInit() {


    //场景一、二表单提交
    layui.use(['form', 'layer'], function () {
        const form = layui.form;
        const layer = layui.layer;

        //场景一表单
        form.on('submit(msg-div-scene1-form-submit)', function (data) {
            console.log(data);
            let formData = data.field;
            let startNodesNum = parseInt(formData.startNodesNum);
            let endNodesNum = parseInt(formData.endNodesNum);
            let interval = parseInt(formData.interval);
            const simulationTime = 5;
            if (startNodesNum > endNodesNum) {
                layer.alert('起始节点数不可以大于终止节点数', {title: '错误提示'})
            } else {
                let nodesList = [];
                for (let i = startNodesNum; i < endNodesNum; i += interval) {
                    nodesList.push(i)
                }
                nodesList.push(endNodesNum);
                layer.confirm(
                    '<div>节点数序列为：' + nodesList.toString() + '</div><div>预计仿真时长为' + ((simulationTime + 10) * nodesList.length) + '秒，继续吗？</div>',
                    {title: '提示'}, function (index) {
                        //do something
                        layer.close(index);
                        //开始场景一仿真
                        $(".msg-div-scene1-tab .not-start-hint").css("display", "none");
                        $(".msg-div-scene1-tab .loading-hint").css("display", "block");
                        console.log(data.field.startNodesNum);
                        console.log(data.field.endNodesNum);
                        console.log(data.field.interval);
                        $.ajax({
                            type: "get",
                            url: "http://" + HOST_ADDR + ":" + MSG_DIV_PORT + "/msgDivWithParam/analyzeMsgDivWithMultiNodes",
                            data: {
                                "startNodesNum": data.field.startNodesNum,
                                "endNodesNum": data.field.endNodesNum,
                                "interval": data.field.interval,
                                "simulationTime": simulationTime
                            },
                            contentType: "application/json",
                            dataType:"json",    //一定要加，否则返回不一定是json对象
                            success: function (rcvMsg) {
                                $(".msg-div-scene1-tab .loading-hint").css("display", "none");
                                $(".msg-div-scene1-delay-content, .msg-div-scene1-throughput-content").css("display", "block");
                                console.log(rcvMsg);
                                renderMsgDivScene1DelayChart(rcvMsg.msgDivDelay);
                                renderMsgDivScene1ThroughputChart(rcvMsg.msgDivThroughput);
                            }
                        });
                    });
            }

            // $.ajax({
            //     type: "get",
            //     url: "http://" + HOST_ADDR + ":" + MSG_DIV_PORT + "/msgDivWithParam/analyzeMsgDivWithTime",
            //     data: {
            //         "nodesNum": data.field.nodesNum,
            //         "simulationTime": data.field.simulationTime
            //     },
            //     contentType: "application/json",
            //     dataType:"json",    //一定要加，否则返回不一定是json对象
            //     success: function (rcvMsg) {
            //         $(".msg-div-scene1-tab .loading-hint").css("display", "none");
            //         $(".msg-div-scene1-delay-content, .msg-div-scene1-throughput-content").css("display", "block");
            //         console.log(rcvMsg);
            //         // renderMsgDivDelayChart(rcvMsg.msgDivDelay);
            //         // renderMsgDivThroughputChart(rcvMsg.msgDivThroughput);
            //     }
            // });
            return false;
        })

        //场景二表单
        form.on('submit(msg-div-scene2-form-submit)', function (data) {
            $(".msg-div-scene2-tab .not-start-hint").css("display", "none");
            $(".msg-div-scene2-tab .loading-hint").css("display", "block");
            console.log(data);
            let formData = data.field;
            $.ajax({
                type: "get",
                url: "http://" + HOST_ADDR + ":" + MSG_DIV_PORT + "/msgDivWithParam/analyzeMsgDivWithTime",
                data: {
                    "nodesNum": data.field.nodesNum,
                    "simulationTime": data.field.simulationTime
                },
                contentType: "application/json",
                dataType: "json",    //一定要加，否则返回不一定是json对象
                success: function (rcvMsg) {
                    $(".msg-div-scene2-tab .loading-hint").css("display", "none");
                    $(".msg-div-scene2-delay-content, .msg-div-scene2-throughput-content").css("display", "block");
                    console.log(rcvMsg);
                    renderMsgDivScene2DelayChart(rcvMsg.msgDivDelay);
                    renderMsgDivScene2ThroughputChart(rcvMsg.msgDivThroughput);
                }
            });
            return false;
        });
    })
    //场景二帮助链接增加监听
    $("#msg-div-scene2-delay-help-tips i").mouseover(function () {
        layui.use(['layer'], function () {
            const layer = layui.layer;
            layer.tips("低时延：小于0.001s<br>中时延：0.001s ~ 3s<br>高时延：大于3s", "#msg-div-scene2-delay-help-tips", {tips: 4});
        })
    });

    $("#msg-div-scene2-delay-help-tips i").mouseout(function () {
        layui.use(['layer'], function () {
            const layer = layui.layer;
            layer.closeAll();
        })
    });

    $("#msg-div-scene2-throughput-help-tips i").mouseover(function () {
        layui.use(['layer'], function () {
            const layer = layui.layer;
            layer.tips("统计间隔: 0.5s", "#msg-div-scene2-throughput-help-tips", {tips: 4});
        })
    });

    $("#msg-div-scene2-throughput-help-tips i").mouseout(function () {
        layui.use(['layer'], function () {
            const layer = layui.layer;
            layer.closeAll();
        })
    });
}

function renderMsgDivScene1DelayChart(delayData) {
    let msgDivDelayChart = echarts.init(document.getElementById('msg-div-scene1-delay-chart'));
    let pointNum = delayData.averageDelayList.length;
    let allPoints = []; //echarts所有点
    for (let i = 0; i < pointNum; i++) {
        let onePoint = []   //echarts单个点
        onePoint.push(delayData.nodesNumList[i]);
        onePoint.push(delayData.averageDelayList[i]);
        allPoints.push(onePoint);
    }
    console.log(allPoints);
    let option = {
        color: ["#3398DB"],
        xAxis: {
            type: 'value',
            name: '节点数',
            min: delayData.nodesNumList[0] > 20 ? delayData.nodesNumList[0] - 15 : 0,
            max: delayData.nodesNumList[pointNum - 1] + 25
        },
        yAxis: {
            type: 'value',
            name: '平均时延（s）'
        },
        tooltip: {
            trigger: "item",
            axisPointer: {
                type: "shadow"
            }
        },
        grid: {
            width: "80%",
            left: "8%",
            top: '15%',
            height: '70%'
        },
        series: [{
            data: allPoints,
            name: "时延",
            type: 'line',
            smooth: 'false'
        }]
    }

    msgDivDelayChart.setOption(option);

}

function renderMsgDivScene1ThroughputChart(throughputData) {
    let msgDivThroughputChart = echarts.init(document.getElementById('msg-div-scene1-throughput-chart'));
    let pointNum = throughputData.averageThroughputRateList.length;
    let allPoints = []; //echarts所有点
    for (let i = 0; i < pointNum; i++) {
        let onePoint = []   //echarts单个点
        onePoint.push(throughputData.nodesNumList[i]);
        let oneThroughputRateKB = throughputData.averageThroughputRateList[i] / 1024;
        onePoint.push(oneThroughputRateKB.toFixed(3));
        allPoints.push(onePoint);
    }
    console.log(allPoints);
    let option = {
        color: ["#b536ba"],
        xAxis: {
            type: 'value',
            name: '节点数',
            min: throughputData.nodesNumList[0] > 20 ? throughputData.nodesNumList[0] - 15 : 0,
            max: throughputData.nodesNumList[pointNum - 1] + 25
        },
        yAxis: {
            type: 'value',
            name: '吞吐率（KB/s）'
        },
        tooltip: {
            trigger: "item",
            axisPointer: {
                type: "shadow"
            }
        },
        grid: {
            width: "80%",
            left: "8%",
            top: '15%',
            height: '70%'
        },
        series: [{
            data: allPoints,
            name: "吞吐率",
            type: 'line',
            smooth: 'false'
        }]
    }

    msgDivThroughputChart.setOption(option);

}

function renderMsgDivScene2DelayChart(delayData) {
    // 基于准备好的dom，初始化echarts实例
    let msgDivDelayChart = echarts.init(document.getElementById("msg-div-scene2-delay-chart"));

    let option = {
        color: ["#3398DB"],
        xAxis: {
            type: 'category',
            data: ['低时延', '中时延', '高时延'],
            name: '类型'
        },
        yAxis: {
            type: 'value',
            name: '包数'
        },
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow"
            }
        },
        grid: {
            width: "70%",
            left: "50",
            top: '15%',
            height: '70%'
        },
        series: [{
            data: [delayData.lowDelayCount, delayData.middleDelayCount, delayData.highDelayCount],
            name: "包数",
            type: 'bar',
            barWidth: '40%'
            // backgroundStyle: {
            //     color: 'rgba(220, 220, 220, 0.8)'
            // }
        }]
    }

    // 使用刚指定的配置项和数据显示图表。
    msgDivDelayChart.setOption(option);

    //渲染右侧说明信息
    $("#msg-div-scene2-delay-all-count b").html(delayData.allDelayCount);
    $("#msg-div-scene2-delay-avg-delay b").html(delayData.averageDelay.toFixed(3));
}

function renderMsgDivScene2ThroughputChart(throughputData) {
// 基于准备好的dom，初始化echarts实例
    let msgDivThroughputChart = echarts.init(document.getElementById("msg-div-scene2-throughput-chart"));

    //将X坐标和Y坐标组装成坐标点
    const numCount = throughputData.intervalXAxisArr.length;
    let allPoints = [];
    let onePoint = [];
    for (let i = 0; i < numCount; i++) {
        onePoint.push(throughputData.intervalXAxisArr[i]);
        onePoint.push(throughputData.intervalThroughputRatesKBArr[i].toFixed(3));
        allPoints.push(onePoint);
        onePoint = [];
    }

    // console.log(numCount);
    console.log(allPoints);
    let option = {
        // color: ["#3398DB"],
        xAxis: {
            type: 'value',
            name: '时间(s)'
        },
        yAxis: {
            type: 'value',
            name: '吞吐率(KB/s)'
        },
        tooltip: {
            trigger: "item",
            axisPointer: {
                type: "shadow"
            }
        },
        grid: {
            width: "70%",
            left: "50",
            top: '15%',
            height: '70%'
        },
        series: [{
            data: allPoints,
            name: "吞吐率",
            type: 'line',
            smooth: 'true'
        }]
    }

    // 使用刚指定的配置项和数据显示图表。
    msgDivThroughputChart.setOption(option);

    //渲染右侧说明信息
    let averageThroughputRateKB = throughputData.averageThroughputRate / 1000;
    $("#msg-div-scene2-avg-throughput-rate b").html(averageThroughputRateKB.toFixed(3));
    $("#msg-div-scene2-simulate-time b").html(throughputData.totalSimulationTime.toFixed(3));
}

