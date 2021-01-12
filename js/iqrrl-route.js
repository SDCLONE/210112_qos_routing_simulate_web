
moduleInit()

function moduleInit() {

    //仿真按钮
    $("#iqrrl-route-simulate-btn").click(function () {
        $(".iqrrl-route-tab .not-start-hint").css("display", "none");
        $(".iqrrl-route-tab .loading-hint").css("display", "block");

        $.ajax({
            type: "get",
            url: "http://" + HOST_ADDR + ":" + IQRRL_ROUTE_PORT + "/iqrrl/analyzeIqrrlTrace",
            contentType: "application/json",
            dataType:"json",    //一定要加，否则返回不一定是json对象
            success: function (rcvMsg) {
                $(".iqrrl-route-tab .loading-hint").css("display", "none");
                $(".iqrrl-route-content, .iqrrl-info-table").css("display", "block")
                console.log(rcvMsg);
                renderIqrrlInfoTable(rcvMsg);
            }
        });

        // //模拟延迟
        // setTimeout(function () {
        //     $(".iqrrl-route-tab .loading-hint").css("display", "none");
        //     $(".iqrrl-route-content").css("display", "block")
        // }, 2000);

    });

    //清除记录按钮
    $("#iqrrl-route-clear-history").click(function () {
        layui.use(['layer'], function () {
            const layer = layui.layer;
            layer.confirm("是否清除路由协议部分的生成文件记录?", {icon: 3, title:'提示'}, function(index){
                //do something
                $.ajax({
                    type: "get",
                    url: "http://" + HOST_ADDR + ":" + IQRRL_ROUTE_PORT + "/iqrrl/clearGeneratedFiles",
                    //没有返回值的话不可以加上dataType = json  或者 contentType = "application/json", 否则会无法进入success函数
                    success: function () {
                        // console.log("清除区分服务成功");
                        // layer.close(index);
                        layer.closeAll();
                        layer.msg("清除生成文件成功");
                    }
                });

            });
        })

    });
}

function renderIqrrlInfoTable(iqrrlInfoData) {
    let innerHtmlStr =
        "<thead>" +
        "   <tr>\n" +
        "      <th lay-data=\"{field:'packageCount'}\">总包数</th>\n" +
        "      <th lay-data=\"{field:'totalTime'}\">持续时间(s)</th>\n" +
        "      <th lay-data=\"{field:'averageDelay'}\">平均时延(s)</th>\n" +
        "      <th lay-data=\"{field:'throughputRate'}\">平均吞吐率(MB/s)</th>\n" +
        "    </tr> " +
        "</thead>" +
        "<tbody>\n" +
        "    <tr>\n" +
        "      <td>" + iqrrlInfoData.iqrrlThroughput.packageCount + "</td>\n" +
        "      <td>" + iqrrlInfoData.iqrrlThroughput.totalTime.toFixed(2) + "</td>\n" +
        "      <td>" + iqrrlInfoData.iqrrlDelay.averageDelay.toFixed(2) + "</td>\n" +
        "      <td>" + (iqrrlInfoData.iqrrlThroughput.throughputRate / 1000).toFixed(2) + "</td>\n" +
        "    </tr>\n" +
        "  </tbody>"
    $("#iqrrl-info-table").html(innerHtmlStr);
    layui.use('table', function () {
        const table = layui.table;
        table.init('iqrrl-info-table', {
            // height: 250
            skin: 'row',
            size: 'lg'
        })
    })
}