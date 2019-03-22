var carMap = {
    沪A00001: {
        id: "沪A00001",
        name:
            "刘德华",
        idNumber:
            "310109198509160018",
        imgURL:
            "newImg/ldh_car.png"
    },
    沪A00000: {
        name: "张学友",
        id: "沪A00000",
        idNumber:
            "310109198509160018",
        imgURL:
            "newImg/zxy_car.png"
    }
};

$(document).ready(function () {
    $('#car_detail_info_tabs').on('click', 'div', function (evt) {
        var target = evt.target;
        var sid = $(target).attr('sid');
        var $lastActiveBtn = $('#car_detail_info_tabs .active');
        // 移除当前按钮的active状态
        $lastActiveBtn.removeClass('active');
        // 移除当前面板的active状态
        var lastSid = $lastActiveBtn.attr('sid');
        $('#' + lastSid).removeClass('active');
        // 增加当前按钮的active状态
        $(target).addClass('active');
        // 增加当前面板的active状态
        $('#' + sid).addClass('active');
    });

    $('#clue-kanban-car-clear').on('click', function (evt) {
        $("#ISL_Clue_Car")[0].style.display = "none";
    });
    initCar();
});

function initCar() {
    for (var key in carMap) {

        var car = carMap[key];

        var cls = "relate-person"
        var trajectoryStyle = {strokeColor: "#009eff", strokeLineDash: [10]};


        var str = '<div class="target-person-div" onclick="showPerson(\'' + car.id + '\')"><img src="' + car.imgURL + '"class="' + cls + '"/><br><span>' + car.name + '</span></div>';
        // $("#target_person_cont").append(str);

        // 关联人员
        var trajectory = getCarTrajectoryArchiveByIdNumber(car.id);
        car.trajectory = trajectory;

        drawTrajectory(trajectory, trajectoryStyle);
    }
}

function getCarTrajectoryArchiveByIdNumber(plateNo) {

    var car = carMap[plateNo];

    var result = {
        type: "carpass",
        id: car.id,
        personName: car.name,
        history: []
    };

    for (var i = 0; i < 5; i++) {
        var cameraId = Math.round(Math.random() * (cameraCount - 1));
        var shotTime = new Date().getTime() - Math.random() * 5000;
        var carpass = {
            cameraId: cameraId,
            shotTime: shotTime,
            imgURL: car.imgURL//todo
        };
        result.history[i] = carpass;
    }

    return result;
}


function showCar(plateNo) {
    $("#ISL_Clue")[0].style.display = "none";

    $("#ISL_Clue_Car")[0].style.display = "block";
    //  ui.style.visibility="visible";

    var car = carMap[plateNo];

    $("#clue-car-kanban-title").html(plateNo + "-车辆信息");
    $("#car_trajectory_detail").html("");
    $("#detail_info_car_name").html(car.name);

    car.trajectory.history.forEach(facePass => {
        var camera = m_CameraMap[facePass.cameraId];
        var shotTime = new Date(facePass.shotTime).format("yyyy/MM/dd hh:mm:ss")
        var str = '<li class="common-trajectory-detail"><img src="' + facePass.imgURL + '"/><div><span>抓拍点位：</span>' + camera.name + '</div><div><span>抓拍时间：</span>' + shotTime + '</div></li>';
        $("#car_trajectory_detail").append(str);
    });
}
