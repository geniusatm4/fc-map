$(document).ready(function () {
    $('#person_detail_info_tabs').on('click', 'div', function (evt) {
        var target = evt.target;
        var sid = $(target).attr('sid');
        var $lastActiveBtn = $('#person_detail_info_tabs .active');
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

    $('#clue-kanban-clear').on('click', function (evt) {
        $("#ISL_Clue")[0].style.display = "none";
    });


    $("#showPersonTrajectoryChkBox").change(function () {
        var personId = $("#detail_info_person_id").val();
        if($('#showPersonTrajectoryChkBox').is(":checked"))
        {
            showTrajectoryByPersonId(personId);


        }else
        {
            hideTrajectoryByPersonId(personId);

        }


    })


});

/* 显示人员详细信息面板
* */
function showPerson(personId) {
    $("#ISL_Clue_Car")[0].style.display = "none";

    $("#ISL_Clue")[0].style.display = "block";
    //  ui.style.visibility="visible";

    var person = m_PersonMap[personId];

    $("#clue-person-kanban-title").html(person.name + "-个人信息");
    $("#person_trajectory_detail").html("");
    $("#detail_info_person_id").val(personId);

    person.trajectory.history.forEach(facePass => {
        var camera = m_CameraMap[facePass.cameraId];
        var shotTime = new Date(facePass.shotTime).format("yyyy/MM/dd hh:mm:ss")
        var str = '<li class="common-trajectory-detail"><img src="' + facePass.imgURL + '"/><div><span>抓拍点位：</span>' + camera.name + '</div><div><span>抓拍时间：</span>' + shotTime + '</div></li>';
        $("#person_trajectory_detail").append(str);
    });
}

function getFaceTrajectoryArchiveByIdNumber(idNumber) {

    var person = m_PersonMap[idNumber];

    var result = {
        id: person.id,
        type: "facepass",
        personName: person.name,
        history: []
    };

    for (var i = 0; i < 5; i++) {
        var cameraId = Math.round(Math.random() * (cameraCount - 1));
        var shotTime = new Date().getTime() - Math.random() * 5000;
        var facepass = {
            cameraId: cameraId,
            shotTime: shotTime,
            imgURL: person.imgURL//todo
        };
        result.history[i] = facepass;
    }

    return result;
}
