$.fn.extend({
    animateCss: function (animationName1, animationName2, delay) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        $('.alert').show().addClass('animated ' + animationName1).one(animationEnd, function () {
            $(this).removeClass('animated ' + animationName1);
            setTimeout(function () {
                $('.alert').addClass('animated ' + animationName2).one(animationEnd, function () {
                    $(this).removeClass('animated ' + animationName2).hide();
                    setTimeout(function () {
                        $('.alert').alert('close');
                        // focusFirstElement();
                    }, 1);
                });
            }, delay);
        });
    }
});

$.fn.extend({
    animateDiv: function (animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function () {
            $(this).removeClass('animated ' + animationName);
        });
        return this;
    }
});

function getTextFiled(title, id, placeholder, type, value = "") {
    let gui = "";

    gui += "<div class='form-group'>";
    gui += "<label for='" + id + "' class='col-sm-3 control-label text-capitalize'>" + title + "</label>";
    gui += "<div class='col-sm-9'>";
    gui += "<input type='" + type + "' id='" + id + "' class='form-control' placeholder='" + placeholder + "' value='" + value + "'>";
    gui += "</div>";
    gui += "</div>";

    return gui;
}

function getButton(type, color, title, id = "") {
    id = id !== "" ? " id = '" + id + "' " : "";
    return "<button type='" + type + "' class='btn btn-" + color + "' " + id + ">" + title + "</button>";
}

function setError(message) {
    return setMessage("danger", message);
}

function setWarning(message) {
    return setMessage("warning", message);
}

function setSuccess(message) {
    return setMessage("success", message);
}

function setMessage(type, message) {
    return {
        "type": type,
        "message": message
    };
}

function showAlert(json_ob) {
    $(".alert").alert('close');

    var alert_data = "<div class='alert alert-" + json_ob.type + "' style='display:none'>";
    if (!json_ob.hasOwnProperty("nodelete")) {
        // alert_data += "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>";
        alert_data += "<a href='#' class='close' data-dismiss='alert' aria-label='close'><i class='fa fa-times-circle'></i></a>";
    }
    alert_data += json_ob.message;
    alert_data += "</div>";
    $("body").append(alert_data);
    var animation = json_ob.type === "danger" ? (json_ob.hasOwnProperty("animation") ? json_ob.animation : "bounceIn") : "shake";//fadeIn

    var duration = json_ob.type === "success" ? 3000 : 5000;

    $('.alert').show().animateCss(animation, 'fadeOut', duration);
}

function triggerTooltip() {
    $('[data-toggle="tooltip"]:not(.unformatted):not(.capitalize):not(.uppercase):not(.lowercase)').tooltip({
        trigger: "hover"
    });
    $('[data-toggle="tooltip"].capitalize').tooltip({
        template: '<div class="tooltip capitalize"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        trigger: "hover"
    });
    $('[data-toggle="tooltip"].uppercase').tooltip({
        template: '<div class="tooltip uppercase"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        trigger: "hover"
    });
    $('[data-toggle="tooltip"].lowercase').tooltip({
        template: '<div class="tooltip lowercase"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        trigger: "hover"
    });
    $('[data-toggle="popover"]').popover();
}

function capitalizeEachWord(string) {
    var splitStr = string.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
}

function destroyModal(ele) {
    var modal_id = ele.attr("id");
    ele.remove();
    $('.modal-backdrop:last').remove();
    if ($(".modal.in").length === 0) {
        $('body').removeClass('modal-open');
    } else if ($(".modal.in").length === 1) {
        if ($(".modal.in:last-child").attr("id") === "advanced_search") {
            $('body').removeClass('modal-open');
        } else {
            $('body').addClass('modal-open');
        }
    }

    $(".alert").remove();
    $(".navbar-fixed-top").css("padding-right", "0px");
}

function isValidMobile(phno) {
    let regexPattern = new RegExp(/^[0-9]+$/);
    // console.log(regexPattern.test(phno));
    return regexPattern.test(phno) && phno.length === 10;
}

function isValidEmail(email) {
    let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}