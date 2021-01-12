
moduleInit();

function moduleInit() {
    //仿真按钮增加监听
    $("#msg-div-scene2-simulate-btn").click(function () {
        $(".msg-div-tab .not-start-hint").css("display", "none");
        $(".msg-div-tab .loading-hint").css("display", "block");

        $.ajax({
            type: "get",
            url: "http://" + HOST_ADDR + ":" + MSG_DIV_PORT + "/msgDiv/analyzeMsgDiv",
            contentType: "application/json",
            dataType:"json",    //一定要加，否则返回不一定是json对象
            success: function (rcvMsg) {
                $(".msg-div-tab .loading-hint").css("display", "none");
                $(".msg-div-scene2-delay-content, .msg-div-scene2-throughput-content").css("display", "block");
                console.log(rcvMsg);
                renderMsgDivDelayChart(rcvMsg.msgDivDelay);
                renderMsgDivThroughputChart(rcvMsg.msgDivThroughput);
            }
        });

    });

    //场景二
    layui.use(['form', 'layer'], function () {
        const form = layui.form;
        const layer = layui.layer;

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
                dataType:"json",    //一定要加，否则返回不一定是json对象
                success: function (rcvMsg) {
                    $(".msg-div-scene2-tab .loading-hint").css("display", "none");
                    $(".msg-div-scene2-delay-content, .msg-div-scene2-throughput-content").css("display", "block");
                    console.log(rcvMsg);
                    renderMsgDivDelayChart(rcvMsg.msgDivDelay);
                    renderMsgDivThroughputChart(rcvMsg.msgDivThroughput);
                }
            });
            return false;
        })
    })


    // //清除记录增加监听
    // $("#clear-msg-div-history").click(function () {
    //     layui.use(['layer'], function () {
    //         const layer = layui.layer;
    //         layer.confirm("是否清除服务区分的生成文件记录?", {icon: 3, title:'提示'}, function(index){
    //             //do something
    //             $.ajax({
    //                 type: "get",
    //                 url: "http://" + HOST_ADDR + ":" + MSG_DIV_PORT + "/msgDiv/clearGeneratedFiles",
    //                 //没有返回值的话不可以加上dataType = json  或者 contentType = "application/json", 否则会无法进入success函数
    //                 success: function () {
    //                     // console.log("清除区分服务成功");
    //                     // layer.close(index);
    //                     layer.closeAll();
    //                     layer.msg("清除生成文件成功");
    //                 }
    //             });
    //
    //         });
    //     })
    // });

    //帮助链接增加监听
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

function renderMsgDivDelayChart(delayData) {
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

function renderMsgDivThroughputChart(throughputData) {
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

