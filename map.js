var map;
var sourceCase;
var cameraCount = 20;
var m_ClueMap = {};
var showFaceInMarker = false;

var sampleColors = ["#9463f7", "#ff4c52", "#eb6709", "#17b3a3", "#0bb2d4", "#3e8ef7", "#526069", "#6B534C"]

var m_CameraMap = {};
var m_MapTrajectoryMap = {};
var m_PersonMap = {
    ldh: {
        isMainPerson: true,
        id: "ldh",
        name:
            "刘德华",
        idNumber:
            "310109198509160018",
        imgURL:
            "newImg/ldh.png"
    },
    zxy: {
        name: "张学友",
        id: "zxy",
        idNumber:
            "310109198509160018",
        imgURL:
            "newImg/zxy.png"
    },
    gfc: {
        name: "郭富城",
        id: "gfc",
        idNumber:
            "310109198509160018",
        imgURL:
            "newImg/gfc.png"
    }
};

$(document).ready(function () {
    map = new EzMap('mapContent');
    map.showMapControl();

    map.centerAndZoom(new EzCoord(121.52, 31.22), 12);

    initCamera();
    initPerson();
    initCase(sourceCase);


    map.addMapEventListener(Ez.Event.MAP_MOUSEMOVE, function (evt) {
        var pixel = evt.pixel;
        var marker = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
            if (feature instanceof EzMarker) {
                return feature;
            }
        });
        if (marker) {
            this.getViewport().style.cursor = 'pointer';
        } else {
            this.getViewport().style.cursor = '';
        }
    }, map);
debugger;
    map.addMapEventListener(Ez.Event.MAP_CLICK, function (evt) {
        var pixel = evt.pixel;
        var coord = evt.coordinate;
        var marker = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
            if (feature instanceof EzMarker) {
                return feature;
            }
        });
        if (marker) {
            if (marker.dataType == "case") {
                showCasePopup(marker.data);
            } else if (marker.dataType == "facepass") {
                showFacePassPopup(marker.data);
            }else if (marker.dataType == "carpass") {
                showCarPassPopup(marker.data);
            }
        }
    }, map);


});

function showCarPassPopup(carPass) {
    var camera = m_CameraMap[carPass.cameraId];
    layer.open({
        type: 2,
        title: '过车抓拍详情-' + camera.name,
        shadeClose: true,
        shade: [0],
        area: ['768px', "480px"],
        content: 'face-pass-popup.html',
        success: function (layero, index) {
        },
        end: function () {
        }
    });
}


function showFacePassPopup(facePass) {
    var camera = m_CameraMap[facePass.cameraId];
    layer.open({
        type: 2,
        title: '人脸抓拍详情-' + camera.name,
        shadeClose: true,
        shade: [0],
        area: ['768px', "480px"],
        content: 'face-pass-popup.html',
        success: function (layero, index) {
        },
        end: function () {
        }
    });
}

function showCasePopup() {
    layer.open({
        type: 2,
        title: '案件详情',
        shadeClose: true,
        shade: [0],
        area: ['768px', "480px"],
        content: 'search_clue.html',
        success: function (layero, index) {
        },
        end: function () {
        }
    });
}

function highlightClue(clueId) {

}


function highlightTrajectory(trajectoryId) {

}

function initPerson() {
    for (var key in m_PersonMap) {

        var person = m_PersonMap[key];

        var cls = "relate-person"
        var trajectoryStyle = {strokeColor: "#009eff"};
        if (person.isMainPerson) {
            cls = "main-person";
            trajectoryStyle.strokeColor = "#F44336";
        }

        var str = '<div class="target-person-div" onclick="showPerson(\'' + person.id + '\')"><img src="' + person.imgURL + '"class="' + cls + '"/><br><span>' + person.name + '</span></div>';
        $("#target_person_cont").append(str);

        // 关联人员
        var trajectory = getFaceTrajectoryArchiveByIdNumber(person.id);
        person.trajectory = trajectory;

        var trajectoryPathId = drawTrajectory(trajectory, trajectoryStyle);
        person.trajectoryPathId = trajectoryPathId;
    }
}

function initCamera() {
    for (var i = 0; i < cameraCount; i++) {

        var lng = 121.33;
        lng += (Math.random() / 3);

        var lat = 31.0;
        lat += (Math.random() / 3);

        var camera = {};
        camera.name = "模拟相机" + i.toString();
        camera.longitude = lng;
        camera.latitude = lat;
        camera.marker = addMarker(lng, lat, "newImg/camera.png");
        m_CameraMap[i] = camera;
    }
}

function initCase() {
    sourceCase = getCaseInfo();

    // 原Case
    var caseMarker = addMarker(sourceCase.longitude, sourceCase.latitude, "newImg/source_case.png");
    caseMarker.data = sourceCase;
    caseMarker.dataType = "case";
    // 关联Case
    sourceCase.relateCase.forEach(relateCase => {
        let caseMarker = addMarker(relateCase.longitude, relateCase.latitude, "newImg/relate_case.png");
        caseMarker.data = caseMarker;
        caseMarker.dataType = "case";
    });


    $(document).on('click', "#ISL_Tab_list li", function () {

        // if(upTabView=="ISL_Cont_layer_list"){
        // 	clearApp.mapClear(false,true);
        // }
        upTabView = sid;

        // 获取点击的导航元素内容标识switchTabView
        var sid = $(this).attr("sid");
        // zhzx项目，渐进式更改业务逻辑
        switchTabView(sid);

        // 显示看板的标题
        $("#navbar-kanban-Title").html($(this).attr('name'));

        // 看板显示与隐藏
        var $kanban = $("#ISL_Cont");
        var status = $kanban.attr('status');

        // Init的各个面板适配器接口，负责向各个面板推送当前的看板状态
        self.updateKanbanStatus(sid);

        if (!$kanban.attr("sid")) {
            $kanban.attr("sid", sid);
        } else {
            if ($kanban.attr("sid") !== sid) {
                $kanban.attr("sid", sid);
                // 修改原始导航按钮的激活选中状态
                $("#ISL_Tab_list li").removeClass("active");
                deactive(self.lastLiBtn);
                $(this).addClass("active");
                self.lastLiBtn = $(this);
                active($(this));
                if (status === 'close') {
                    $kanban.css('display', 'block').css('animation', 'kanbanin 2s ease-out');
                    $kanban.attr('status', 'open');
                    $(this).addClass("active");
                    // active($(this));
                    // self.lastLiBtn = $(this);
                }
                return;
            }
        }

        if (status === 'close') {
            $kanban.css('display', 'block').css('animation', 'kanbanin 1s ease-out');
            $kanban.attr('status', 'open');
            if (sid === 'ISL_Cont_Search_list') {
                $("#ISL_Cont_Search_list").attr('status', 'open');
            }
            $(this).addClass("active");
            active($(this));
            self.lastLiBtn = $(this);
        } else {
            $kanban.css('display', '');
            $kanban.attr('status', 'close');
            if (sid === 'ISL_Cont_Search_list') {
                $("#ISL_Cont_Search_list").attr('status', 'close');
            }
            $("#ISL_Tab_list li").removeClass("active");
            deactive(self.lastLiBtn);
            self.lastLiBtn = undefined;
        }
    });

}

function addMarker(lng, lat, imgSrc) {
    var position = new EzCoord(lng, lat);
    var icon1 = new EzIcon({
        src: imgSrc,
        scale: 0.8
    });
    var marker = new EzMarker(position, icon1);
    map.addOverlay(marker);
    return marker;
}

function hideTrajectoryByPersonId(personId) {

    var mapObjects = m_MapTrajectoryMap[m_PersonMap[personId].trajectoryPathId];

    mapObjects.markers.forEach(marker => {
        marker.hide();
    });

    mapObjects.polyline.hide();
}


function showTrajectoryByPersonId(personId) {

    var mapObjects = m_MapTrajectoryMap[m_PersonMap[personId].trajectoryPathId];

    mapObjects.markers.forEach(marker => {
        marker.show();
    });

    mapObjects.polyline.show();
}

function drawTrajectory(trajectory, style) {
    var trajectoryMapObjectsId = new Date().getTime();

    var trajectoryMapObjects = {};
    m_MapTrajectoryMap[trajectoryMapObjectsId] = trajectoryMapObjects;
    trajectoryMapObjects.markers = [];

    var str = "";
    trajectory.history.forEach(facePass => {
        if (str != "") {
            str += ",";
        }
        var camera = m_CameraMap[facePass.cameraId];

        // 获取要素的坐标字符串
        var coords = new EzCoord(camera.longitude, camera.latitude);

        var faceImgURL = "newImg/faceMarker.png";

        if (showFaceInMarker) {
            faceImgURL = facePass.imgURL;
        }

        let marker = addMarker(camera.longitude, camera.latitude, facePass.imgURL);
        marker.dataType = trajectory.type;
        marker.data = facePass;
        trajectoryMapObjects.markers[trajectoryMapObjects.markers.length] = marker;

        str += (camera.longitude + "," + camera.latitude)
    });

    var polyline = new Ez.g.Polyline(str, {
        'strokeColor': style.strokeColor,
        'strokeOpacity': .99,
        'strokeLineDash': style.strokeLineDash,
        'strokeWidth': 3
    });
    map.addOverlay(polyline);

    trajectoryMapObjects.polyline = polyline;


    return trajectoryMapObjectsId;
}

function getCaseInfo() {
    return {
        caseName: "案件001",
        createTime: "2018/08/08 08:08:08",
        longitude: 121.54,
        latitude: 31.23,
        caseType: 1,
        relateCase: [{
            caseName: "案件002",
            createTime: "2018/08/08 08:08:08",
            longitude: 121.56,
            latitude: 31.24,
            caseType: 2
        }],
        persons: [{
            name: "刘德华",
            idNumber: "310109198509160018",
            imgURL: "newImg/ldh.png"
        }, {
            name: "张学友",
            idNumber: "310109198509160018",
            imgURL: "newImg/zxy.png"
        }]
    }
}




var upTabView = "ISL_Cont_layer_list";

function switchTabView(sid, id) {

    upTabView = sid;

    // $(".ISL_Tab_list li").removeClass("active");
    // $(".ISL_Tab_list li[sid='"+sid+"']").addClass("active");

    // 隐藏原始激活的看板内容
    // 没有ID表示通过导航按钮进行切换
    if (!id) {
        // 隐藏主要导航看板的内容
        $(".navbar-kanban-content > .page-active").removeClass("page-active");
    }

    // 如果有ID，需要分类，如果是结果类Cont需要进行替换
    if (id) {
        $(".assist-kanban-content > .page-active").removeClass("page-active");
        $("#ISL_Cont_Search_list > .page-active").removeClass("page-active");
    }

    if (!id) {
        id = sid;
    }

    $("#" + id).addClass("page-active");

    if (sid == 'ISL_Cont_resource_list') {
        $("#Content_list").hide();
        $("#ditucss").show();
        $("#arrow").hide();
        $("#dataNotFindView").hide();
        getResourceCount();//显示资源中心总数
        getLeftLayer("");
    } else {
        $("#ISL_Cont_resource_list").hide();
        $("#Content_list").show();
        $("#ditucss").hide();
        $("#arrow").show();
        $("#dataNotFindView").show();
    }
    if (sid == "ISL_Cont_gpsv1_list") {
        $("#d_filter_dev").show();
        $("#d_filter_detalies").hide();
    } else {
        $("#d_filter_dev").hide();
        $("#d_filter_detalies").hide();
    }
    if (sid == "d_filter_detalies") {
        $("#d_filter_detalies").show();
        $("#d_filter_dev").hide();
    }
    if (sid == "ISL_Cont_track_list") {
        $("#d_filter_track").show();
    } else {
        $("#d_filter_track").hide();
    }
    if (sid == "ISL_Cont_gpsv1_list" || sid == "ISL_Cont_track_list") {
        $("#con_one_1").hide();
        $("#d_header_serach").show();
        GPSload();
    } else {
        $("#con_one_1").show();
        $("#d_header_serach").hide();
    }
    iframeHeight();
}

Date.prototype.format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}