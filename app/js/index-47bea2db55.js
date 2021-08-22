let empty_object = {
    "id": "",
    "name": "",
    "email": "",
    "memory_limit": "",
    "operation": "singup"
};

let logged_in_object = empty_object;
let selected_files = [];
let file_constraints = {};

$(document).ready(function () {
    isLoggedIn();

    // getUserData();

    $(document).on('hidden.bs.modal', "#upload_modal", function (e) {
        selected_files = [];
    });

    $(document).on('show.bs.modal', "#upload_modal", function (e) {
        dragAndDropFunctions();
    });

    $(document).on("click", ".delete_selected_file", function () {
        removeSelectedFile($(this).closest("tr").attr("data-selected_file_index"))
    });

    $(document).on("change", "#user_file", function () {
        updateSelectedFileTable($(this).prop('files'));
    });

    $(document).on("click", "#confirm_file_delete", function () {
        deleteFile($(this).attr("data-file_name"));
    });

    $(document).on("click", "#edit_profile", function () {
        getEditProfile();
    });

    $(document).on("click", ".delete_file", function () {
        openConfirmDeleteModal($(this));
    });

    $(document).on("click", "#upload_file", function () {
        openUploadModal();
    });

    $(document).on("click", "#change_password_gui", function () {
        openChangePasswordModal();
    });

    $(document).on("click", ".set_password", function () {
        openChangeUserPasswordModal($(this));
    });

    $(document).on("click", "#logout", function () {
        openConfirmLogout();
    });

    $(document).on("click", "#confirm_logout", function () {
        logout();
    });

    $(document).on("click", "#add_user", function () {
        openUserModal("add", "primary", getEmptyObject("add"));
    });

    $(document).on("click", ".edit_user", function () {
        getUserData($(this).closest("tr").attr("data-id"));
    });

    $(document).on("submit", "#sign_up_form", function () {
        if (isLoginFormValid()) {
            checkLogin();
        }
        return false;
    });

    $(document).on("submit", "#change_password_form", function () {
        if (isLoginFormValid()) {
            changePassword($(this));
        }
        return false;
    });

    $(document).on("submit", "#file_upload_form", function () {
        if (isFilesValid()) {
            uploadFiles(0);
        }
        return false;
    });

    $(document).on("submit", "#add_edit_form", function () {
        if (isLoginFormValid()) {
            addEditUser($(this));
        }
        return false;
    });

    $(document).on("submit", "#login_form", function () {
        if (isLoginFormValid()) {
            checkLogin();
        }
        return false;
    });

    $(document).on("click", "#sign_up_gui", function () {
        displaySignUpForm(getEmptyObject("signup"));
    });

    $(document).on("click", "#sign_in_gui", function () {
        displayLoginForm(empty_object);
    });
});

function isFilesValid() {
    return true;
}

function getEmptyObject(operation) {
    let ob = empty_object;
    ob.operation = operation;
    return ob;
}

function getUserForm(json_ob, id) {
    console.log(json_ob, id);
    let gui = "";

    gui += "<form class='form-horizontal' id='" + id + "'>";

    gui += getTextFiled("Name", "user_name", "Name", "text", json_ob.name);
    gui += getTextFiled("Email", "user_email", "Email", "email", json_ob.email);

    switch (json_ob.operation) {
        case "signup":
            gui += getTextFiled("Password", "user_password", "Password", "password");
            gui += getTextFiled("Repeat Password", "user_password_2", "Repeat Password", "password");
            break;
        case "add":
        case "edit":
            gui += getTextFiled("Memory", "memory_limit", "Memory", "text", json_ob.memory_limit);
            break;
    }

    gui += "<div class='form-group btn_group'>";
    gui += "<div class='col-sm-offset-2 col-sm-10'>";

    if (json_ob.operation === "signup") {
        gui += getButton("submit", "primary", "Sign Up");
        gui += getButton("reset", "default", "Clear");
        gui += getButton("button", "info pull-right", "Sign In", "sign_in_gui");
    }

    gui += "</div>";
    gui += "</div>";
    gui += "</form>";

    return gui;
}

function displaySignUpForm() {
    let gui = "";
    gui += "<div class='row'>";
    gui += "<div class='col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-3'>";
    gui += "<fieldset>";
    gui += "<legend>Sign-Up</legend>";

    gui += getUserForm(empty_object, "sign_up_form");

    gui += "</fieldset>";
    gui += "</div>";
    gui += "</div>";

    $("#main_container").html(gui);
}

function isLoginFormValid() {
    return true;
}

function checkLogin() {
    $.ajax({
        url: "../classes/user.php",
        beforeSend: function () {
        },
        data: {
            operation: "check_login",
            email: $("#login_form #user_email").val(),
            password: $("#login_form #user_password").val()
        },
        type: "POST",
        success: function (response) {
            var json_ob = JSON.parse(response);
            if (json_ob !== false) {
                if (json_ob.logged_in_user === false) {
                    showAlert(setError("Invalid credentials"));
                } else {
                    showAlert(setSuccess("Welcome " + capitalizeEachWord(json_ob.logged_in_user.name)));
                    logged_in_object = json_ob.logged_in_user;
                    file_constraints = json_ob.file_constraints;

                    if (json_ob.hasOwnProperty("users")) {
                        displayUserTable(json_ob.users);
                    } else {
                        displayUserFiles(json_ob);
                    }
                }
            }
        },
        error: function (response) {
        }
    });
}

function addEditUser(ele) {
    let operation = $("#user_operation").attr("data-operation");
    let id = $("#user_operation").attr("data-user_id");

    $.ajax({
        url: "../classes/user.php",
        beforeSend: function () {
        },
        data: {
            operation: operation,
            id: id,
            name: $("#add_edit_form #user_name").val(),
            email: $("#add_edit_form #user_email").val(),
            memory_limit: $("#add_edit_form #memory_limit").val()
        },
        type: "POST",
        success: function (response) {
            var json_ob = JSON.parse(response);
            if (json_ob !== false) {
                destroyModal($("#user_modal"));
                showAlert(json_ob.message);
                logged_in_object = json_ob.logged_in_user;
                $("#logged_username").html(logged_in_object.name);
                displayUserTable(json_ob.users);
            }
        },
        error: function (response) {
        }
    });
}

function displayLoginForm(login_object) {
    let gui = "";

    gui += "<div class='row'>";
    gui += "<div class='col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-3'>";
    gui += "<fieldset>";
    gui += "<legend>Login</legend>";
    gui += "<form class='form-horizontal' id='login_form'>";

    gui += getTextFiled("Email", "user_email", "Email", "email", login_object.email);
    gui += getTextFiled("Password", "user_password", "Password", "password");

    gui += "<div class='form-group btn_group'>";
    gui += "<div class='col-sm-offset-3 col-sm-9 text-center'>";

    gui += getButton("submit", "primary", "Sign In");
    gui += getButton("reset", "default", "Clear");
    // gui += getButton("button", "info pull-right", "Sign Up", "sign_up_gui");

    gui += "</div>";
    gui += "</div>";
    gui += "</form>";
    gui += "</fieldset>";
    gui += "</div>";
    gui += "</div>";

    $("#main_container").html(gui);
}


function getUserData(id = "") {
    $.ajax({
        url: "../classes/user.php",
        beforeSend: function () {
        },
        data: {
            operation: "get_user_data",
            id: id
        },
        type: "POST",
        success: function (response) {
            var json_ob = JSON.parse(response);
            if (json_ob !== false) {
                if (id === "") {
                    displayUserTable(json_ob);
                } else {
                    json_ob[0].operation = "edit";
                    openUserModal("edit", "warning", json_ob[0]);
                }
            }
        },
        error: function (response) {
        }
    });
}

function getProfileMenu(jsob_ob) {
    let gui = "";
    gui += "<div class='btn-group pull-right'>";
    gui += "<button type='button' class='btn btn-default btn-xs dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>";
    gui += "Welcome <span id='logged_username'>" + capitalizeEachWord(jsob_ob.name) + "</span> <span class='caret'></span>";
    gui += "</button>";
    gui += "<ul class='dropdown-menu'>";
    gui += "<li><a href='#' id='edit_profile'>Edit Profile</a></li>";
    gui += "<li><a href='#' id='change_password_gui'>Change Password</a></li>";
    gui += "<li><a href='#' id='logout'>Logout</a></li>";
    gui += "</ul>";
    gui += "</div>";
    return gui;
}

function displayUserTable(json_ob) {
    let gui = "";

    gui += "<div class='row'>";
    gui += "<div class='col-md-7'>";
    gui += "<div class='table-responsive'>";
    gui += "<table class='table table-bordered'>";
    gui += "<caption>";
    gui += getButton("button", "primary btn-xs", "Add User", "add_user");
    gui += getProfileMenu(logged_in_object);
    gui += "</caption>";
    gui += "<thead>";
    gui += "<tr>";
    gui += "<th class='small_cell'>#</th>";
    gui += "<th class='small_cell'>Operations</th>";
    gui += "<th>Name</th>";
    gui += "<th>Email</th>";
    gui += "<th>Limit</th>";
    gui += "</tr>";
    gui += "</thead>";
    gui += "<tbody>";

    $.each(json_ob, function (i, row) {
        gui += "<tr data-id='" + row.id + "'>";
        gui += "<td class='small_cell text-center'>" + (i + 1) + "</td>";
        gui += "<td class='btn_group'>";
        gui += getButton("button", "info btn-xs set_password", "Pass");
        gui += getButton("button", "warning btn-xs edit_user", "Edit");
        gui += getButton("button", "danger btn-xs delete_user", "Delete");
        gui += "</td>";
        gui += "<td>" + row.name + "</td>";
        gui += "<td>" + row.email + "</td>";
        gui += "<td class='small_cell text-center'>" + row.memory_limit + "</td>";
        gui += "</tr>";
    });

    gui += "</tbody>";
    gui += "</table>";
    gui += "</div>";
    gui += "</div>";
    gui += "</div>";

    $("#main_container").html(gui);
}

function displayUserFiles(json_ob) {
    let gui = "";

    gui += "<div class='row'>";
    gui += "<div class='col-md-7'>";
    gui += "<div class='table-responsive'>";
    gui += "<table class='table table-bordered'>";
    gui += "<caption>";
    gui += getButton("button", "primary btn-xs", "Upload", "upload_file");
    gui += getProfileMenu(logged_in_object);
    gui += "</caption>";
    gui += "<thead>";
    gui += "<tr>";
    gui += "<th colspan='4' class='text-right'>Memory Usage : " + json_ob.user_files.total_size + " / " + logged_in_object.memory_limit + " MB</th>";
    gui += "</tr>";

    gui += "<tr>";
    gui += "<th class='small_cell'>#</th>";
    gui += "<th class='small_cell'>Operations</th>";
    gui += "<th>File</th>";
    gui += "<th>Size</th>";
    gui += "</tr>";
    gui += "</thead>";
    gui += "<tbody>";

    $.each(json_ob.user_files.files, function (i, file) {
        gui += "<tr data-file_name='" + file.name + "'>";
        gui += "<td class='small_cell text-center'>" + (i + 1) + "</td>";
        gui += "<td class='btn_group text-center'>";
        gui += getButton("button", "danger btn-xs delete_file", "Delete");
        gui += "</td>";
        gui += "<td>" + file.name + "<a target='_blank' data-toggle='tooltip' title='Download' href='../classes/user.php?operation=download_file&f=" + file.name + "' class='pull-right'><i class='fa fa-download'></i></a></td>";
        gui += "<td class='small_cell text-right'>" + file.size + "</td>";
        gui += "</tr>";
    });

    gui += "</tbody>";
    gui += "</table>";
    gui += "</div>";
    gui += "</div>";
    gui += "</div>";

    $("#main_container").html(gui);
    triggerTooltip();
}

function openUserModal(operation, color = "primary", json_ob = null) {
    json_ob = json_ob !== null ? json_ob : empty_object;
    operation = capitalizeEachWord(operation);
    var modal_id = "user_modal";

    var gui = "";
    gui += "<div id='" + modal_id + "' class='modal " + color + " fade' role='dialog'>";
    gui += "<div class='modal-dialog'>";
    gui += "<div class='modal-content'>";
    gui += "<div class='modal-header'><h4 class='modal-title text-capitalize'>" + operation + " User</h4></div>";
    gui += "<div class='modal-body'>";

    json_ob.operation = "edit_profile";
    gui += getUserForm(json_ob, "add_edit_form");

    let id = "";

    if (json_ob !== null) {
        if (json_ob.hasOwnProperty("id")) {
            id = " data-user_id='" + json_ob.id + "'";
        }
    }

    gui += "</div>";
    gui += "<div class='modal-footer'>";
    gui += "<button type='submit' form='add_edit_form' " + id + " data-operation='user_" + operation.toLowerCase() + "' id='user_operation' class='btn btn-" + color + "'>" + operation + "</button>";
    gui += "<button type='reset' form='add_edit_form' class='btn btn-default'>Clear</button>";
    gui += "<button type='button' class='btn btn-default' data-dismiss='modal'>Cancel</button>";
    gui += "</div>";
    gui += "</div>";
    gui += "</div>";
    gui += "</div>";

    if ($('#' + modal_id).length) {
        $('#' + modal_id).replaceWith(gui);
    } else {
        $("body").append(gui);
    }

    $('#' + modal_id).modal({backdrop: 'static', keyboard: false}, 'show');


    if ($(".modal.in").length > 0) {
        var zindex = JSON.parse($(".modal.in:last").css("z-index"));
        $('#' + modal_id).css("z-index", zindex + 1);
    }

    triggerTooltip();
}

function openChangeUserPasswordModal(ele) {
    let color = "info";
    var modal_id = "change_password_modal";

    var gui = "";
    gui += "<div id='" + modal_id + "' class='modal " + color + " fade' role='dialog'>";
    gui += "<div class='modal-dialog'>";
    gui += "<div class='modal-content'>";
    gui += "<div class='modal-header'><h4 class='modal-title text-capitalize'>Change User Password</h4></div>";
    gui += "<div class='modal-body'>";

    gui += "<form class='form-horizontal' id='change_password_form'>";
    gui += getTextFiled("Admin Password", "current_user_password", "Admin Password", "password");
    gui += getTextFiled("User Password", "user_password", "User Password", "password");
    gui += getTextFiled("Repeat User Password", "user_password_2", "Repeat User Password", "password");
    gui += "<input type='hidden' id='user_password_id' value='" + ele.closest("tr").attr("data-id") + "'>";
    gui += "</form>";

    gui += "</div>";
    gui += "<div class='modal-footer'>";
    gui += "<button type='submit' form='change_password_form' id='change_password' class='btn btn-" + color + "'>Change</button>";
    gui += "<button type='reset' form='change_password_form' class='btn btn-default'>Clear</button>";
    gui += "<button type='button' class='btn btn-default' data-dismiss='modal'>Cancel</button>";
    gui += "</div>";
    gui += "</div>";
    gui += "</div>";
    gui += "</div>";

    if ($('#' + modal_id).length) {
        $('#' + modal_id).replaceWith(gui);
    } else {
        $("body").append(gui);
    }

    $('#' + modal_id).modal({backdrop: 'static', keyboard: false}, 'show');


    if ($(".modal.in").length > 0) {
        var zindex = JSON.parse($(".modal.in:last").css("z-index"));
        $('#' + modal_id).css("z-index", zindex + 1);
    }

    triggerTooltip();
}

function openChangePasswordModal() {
    let color = "warning";
    var modal_id = "change_password_modal";

    var gui = "";
    gui += "<div id='" + modal_id + "' class='modal " + color + " fade' role='dialog'>";
    gui += "<div class='modal-dialog'>";
    gui += "<div class='modal-content'>";
    gui += "<div class='modal-header'><h4 class='modal-title text-capitalize'>Change Password</h4></div>";
    gui += "<div class='modal-body'>";

    gui += "<form class='form-horizontal' id='change_password_form'>";
    gui += getTextFiled("Current Password", "current_user_password", "Current Password", "password");
    gui += getTextFiled("New Password", "user_password", "New Password", "password");
    gui += getTextFiled("Repeat New Password", "user_password_2", "Repeat New Password", "password");
    gui += "</form>";

    gui += "</div>";
    gui += "<div class='modal-footer'>";
    gui += "<button type='submit' form='change_password_form' id='change_password' class='btn btn-" + color + "'>Change</button>";
    gui += "<button type='reset' form='change_password_form' class='btn btn-default'>Clear</button>";
    gui += "<button type='button' class='btn btn-default' data-dismiss='modal'>Cancel</button>";
    gui += "</div>";
    gui += "</div>";
    gui += "</div>";
    gui += "</div>";

    if ($('#' + modal_id).length) {
        $('#' + modal_id).replaceWith(gui);
    } else {
        $("body").append(gui);
    }

    $('#' + modal_id).modal({backdrop: 'static', keyboard: false}, 'show');


    if ($(".modal.in").length > 0) {
        var zindex = JSON.parse($(".modal.in:last").css("z-index"));
        $('#' + modal_id).css("z-index", zindex + 1);
    }

    triggerTooltip();
}

function openConfirmDeleteModal(ele) {
    let color = "danger";
    var modal_id = "file_delete_modal";

    var gui = "";
    gui += "<div id='" + modal_id + "' class='modal " + color + " fade' role='dialog'>";
    gui += "<div class='modal-dialog modal-sm'>";
    gui += "<div class='modal-content'>";
    gui += "<div class='modal-header'><h4 class='modal-title text-capitalize'>Confirm Delete</h4></div>";
    gui += "<div class='modal-body'>";

    gui += "<p><strong>" + ele.closest("tr").attr("data-file_name") + "</strong></p>";
    gui += "Do you really want to delete?";

    gui += "</div>";
    gui += "<div class='modal-footer'>";
    gui += "<button type='submit' id='confirm_file_delete' data-file_name='" + ele.closest("tr").attr("data-file_name") + "' class='btn btn-" + color + "'>Yes</button>";
    gui += "<button type='button' class='btn btn-default' data-dismiss='modal'>No</button>";
    gui += "</div>";
    gui += "</div>";
    gui += "</div>";
    gui += "</div>";

    if ($('#' + modal_id).length) {
        $('#' + modal_id).replaceWith(gui);
    } else {
        $("body").append(gui);
    }

    $('#' + modal_id).modal({backdrop: 'static', keyboard: false}, 'show');


    if ($(".modal.in").length > 0) {
        var zindex = JSON.parse($(".modal.in:last").css("z-index"));
        $('#' + modal_id).css("z-index", zindex + 1);
    }

    triggerTooltip();
}

function openConfirmLogout() {
    let color = "danger";
    var modal_id = "logout_modal";

    var gui = "";
    gui += "<div id='" + modal_id + "' class='modal " + color + " fade' role='dialog'>";
    gui += "<div class='modal-dialog modal-sm'>";
    gui += "<div class='modal-content'>";
    gui += "<div class='modal-header'><h4 class='modal-title text-capitalize'>Confirm Logout</h4></div>";
    gui += "<div class='modal-body'>";

    gui += "Do you really want to logout?";

    gui += "</div>";
    gui += "<div class='modal-footer'>";
    gui += "<button type='submit' id='confirm_logout' class='btn btn-" + color + "'>Yes</button>";
    gui += "<button type='button' class='btn btn-default' data-dismiss='modal'>No</button>";
    gui += "</div>";
    gui += "</div>";
    gui += "</div>";
    gui += "</div>";

    if ($('#' + modal_id).length) {
        $('#' + modal_id).replaceWith(gui);
    } else {
        $("body").append(gui);
    }

    $('#' + modal_id).modal({backdrop: 'static', keyboard: false}, 'show');


    if ($(".modal.in").length > 0) {
        var zindex = JSON.parse($(".modal.in:last").css("z-index"));
        $('#' + modal_id).css("z-index", zindex + 1);
    }

    triggerTooltip();
}

function openUploadModal() {
    let color = "primary";
    var modal_id = "upload_modal";

    var gui = "";
    gui += "<div id='" + modal_id + "' class='modal " + color + " fade' role='dialog'>";
    gui += "<div class='modal-dialog'>";
    gui += "<div class='modal-content'>";
    gui += "<div class='modal-header'><h4 class='modal-title text-capitalize'>Upload File</h4></div>";
    gui += "<div class='modal-body'>";

    gui += "<form id='file_upload_form' action='upload.php' method='post' enctype='multipart/form-data' class='form-horizontal'>";

    gui += "<div class='form-group'>";
    gui += "<label for='user_file' class='col-sm-2 control-label'>File</label>";
    gui += "<div class='col-sm-10'>";
    gui += "<input type='file' class='form-control' id='user_file' multiple>";
    gui += "</div>";
    gui += "</div>";

    gui += getSelectedFileTable();

    gui += "</form>";


    gui += "</div>";
    gui += "<div class='modal-footer'>";
    gui += "<button type='submit' form='file_upload_form' class='btn btn-" + color + "'>Upload</button>";
    gui += "<button type='button' class='btn btn-default' data-dismiss='modal'>Cancel</button>";
    gui += "</div>";
    gui += "</div>";
    gui += "</div>";
    gui += "</div>";

    if ($('#' + modal_id).length) {
        $('#' + modal_id).replaceWith(gui);
    } else {
        $("body").append(gui);
    }

    $('#' + modal_id).modal({backdrop: 'static', keyboard: false}, 'show');


    if ($(".modal.in").length > 0) {
        var zindex = JSON.parse($(".modal.in:last").css("z-index"));
        $('#' + modal_id).css("z-index", zindex + 1);
    }

    triggerTooltip();
}

function isLoggedIn() {
    // console.log("is logged in called");
    $.ajax({
        url: "../classes/user.php",
        beforeSend: function () {
        },
        data: {
            operation: "is_logged_in"
        },
        type: "POST",
        success: function (response) {
            var json_ob = JSON.parse(response);
            if (json_ob !== false) {
                console.log(json_ob);
                if (json_ob.logged_in_user === false) {
                    displayLoginForm(empty_object);
                } else {
                    logged_in_object = json_ob.logged_in_user;
                    file_constraints = json_ob.file_constraints;

                    if (json_ob.hasOwnProperty("users")) {//admin
                        displayUserTable(json_ob.users);
                    } else {
                        displayUserFiles(json_ob);
                    }
                }
            }
        },
        error: function (response) {

        }
    });
}

function logout() {
    $.ajax({
        url: "../classes/user.php",
        beforeSend: function () {
        },
        data: {
            operation: "signout"
        },
        type: "POST",
        success: function (response) {
            var json_ob = JSON.parse(response);
            if (json_ob !== false) {
                destroyModal($("#logout_modal"));
                displayLoginForm(empty_object);
                showAlert(json_ob);
            }
        },
        error: function (response) {
        }
    });
}

function getEditProfile() {
    $.ajax({
        url: "../classes/user.php",
        beforeSend: function () {
        },
        data: {
            operation: "get_edit_profile"
        },
        type: "POST",
        success: function (response) {
            var json_ob = JSON.parse(response);
            if (json_ob !== false) {
                json_ob[0].operation = "edit";
                openUserModal("edit", "warning", json_ob[0]);
            }
        },
        error: function (response) {
        }
    });
}

function changePassword(ele) {
    let data = {
        operation: "change_password",
        current_password: $("#change_password_form #current_user_password").val(),
        user_password: $("#change_password_form #user_password").val(),
        user_password_2: $("#change_password_form #user_password_2").val()
    };

    if (ele.find("#user_password_id").length) {
        data["id"] = ele.find("#user_password_id").val();
    }

    $.ajax({
        url: "../classes/user.php",
        beforeSend: function () {
        },
        data: data,
        type: "POST",
        success: function (response) {
            var json_ob = JSON.parse(response);
            if (json_ob !== false) {
                if (json_ob.logged_in_user === false) {
                    showAlert(setError("Invalid credentials"));
                } else {
                    destroyModal($("#change_password_modal"));
                    showAlert(json_ob.message);
                    logged_in_object = json_ob.logged_in_user;
                    displayUserTable(json_ob.users);
                }
            }
        },
        error: function (response) {
        }
    });
}

function uploadFiles(index) {
    var file_data = selected_files[index];//$('#user_file').prop('files')[0];
    var form_data = new FormData();
    form_data.append('user_files', file_data);
    form_data.append('operation', "file_upload");


    var progress_bar = "<div class='progress'>";
    progress_bar += "<div class='progress-bar progress-bar-primary progress-bar-striped active' role='progressbar' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100' style='width: 0%'>";
    progress_bar += "0%";
    progress_bar += "<span class='sr-only'>0% Complete (success)</span>";
    progress_bar += "</div>";
    progress_bar += "</div>";

    $.ajax({
        xhr: function () {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener('progress', function (ev) {
                if (ev.lengthComputable) {
                    let form_modal = $("#upload_modal");
                    let selector = "[data-selected_file_index='" + index + "'] .progress_cell";

                    if (form_modal.find(".modal-body " + selector + " .progress").length === 0) {
                        form_modal.find(".modal-body " + selector).html(progress_bar);
                    }

                    var percentage = Math.round(ev.loaded / ev.total * 100);
                    changeProgressBarStatus(form_modal.find(".modal-body " + selector + " .progress-bar"), percentage);
                    if (percentage === 100) {
                        savingProgressBarStatus(form_modal.find(".modal-body " + selector + " .progress-bar"));
                    }
                }
            });
            return xhr;
        },

        url: "../classes/user.php",
        beforeSend: function () {
        },
        cache: false,
        contentType: false,
        processData: false,
        data: form_data,
        type: "POST",
        success: function (response) {
            var json_ob;
            if (index !== (selected_files.length - 1)) {

                json_ob = JSON.parse(response);
                if (json_ob !== false) {
                    if (JSON.parse(json_ob.status) === 2) {
                        // destroyModal($("#upload_modal"));
                        displayUserFiles(json_ob);
                    } else {
                        let form_modal = $("#upload_modal");
                        let selector = "[data-selected_file_index='" + index + "'] .progress_cell";
                        form_modal.find(selector).html("Exist");
                    }
                }

                uploadFiles(++index);
            } else {
                json_ob = JSON.parse(response);
                if (json_ob !== false) {
                    if (JSON.parse(json_ob.status) === 2) {
                        // destroyModal($("#upload_modal"));
                        displayUserFiles(json_ob);
                    } else {
                        let form_modal = $("#upload_modal");
                        let selector = "[data-selected_file_index='" + index + "'] .progress_cell";
                        form_modal.find(selector).html("<i class='fa fa-ban'></i>");
                    }
                    showAlert(json_ob.message);
                }
            }
        },
        error: function (response) {
        }
    });
}

function deleteFile(file) {
    $.ajax({
        url: "../classes/user.php",
        beforeSend: function () {
        },
        data: {
            operation: "delete_file",
            file: file
        },
        type: "POST",
        success: function (response) {
            var json_ob = JSON.parse(response);
            if (json_ob !== false) {
                destroyModal($("#file_delete_modal"));
                displayUserFiles(json_ob);
                showAlert(json_ob.message);
            }
        },
        error: function (response) {
        }
    });
}

function changeProgressBarStatus(ele, percentage) {
    ele.attr('aria-valuenow', percentage).css('width', percentage + "%").text(percentage + "%");
}

function savingProgressBarStatus(ele) {
    // ele.text("Upload Completed. Saving data");
}

function updateSelectedFileTable(files) {
    let max_files_count_error = false;
    let max_file_size_error = false;

    $.each(files, function (i, file) {

        if (!max_files_count_error) {
            let found = false;
            $.each(selected_files, function (i, selected_file) {
                if (file.name === selected_file.name) {
                    found = true;
                    return;
                }
            });

            if (!found) {
                if (selected_files.length < file_constraints.max_files_count) {
                    if (file.size < file_constraints.max_file_size) {
                        selected_files.push(file);
                    } else {
                        max_file_size_error = true;
                        return;
                    }
                } else {
                    max_files_count_error = true;
                    return;
                }
            }
        }
    });

    $("#user_file").val("");

    if (max_files_count_error) {
        showAlert(setError("Can't add more than " + file_constraints.max_files_count + " files"));
    } else if (max_file_size_error) {
        showAlert(setError("Can't add file larger than " + formatSizeUnits(file_constraints.max_file_size) + " "));
    }

    displaySelectedFiles();
}

function getSelectedFileTable() {
    let total_size = 0;
    let rows = "";
    $.each(selected_files, function (i, selected_file) {
        total_size += Number(selected_file.size);
        rows += "<tr data-selected_file_index='" + i + "'>";
        rows += "<td class='small_cell text-center'>" + (i + 1) + "</td>";
        rows += "<td class='small_cell text-center'>";
        rows += getButton("button", "danger btn-xs delete_selected_file", "Delete");
        rows += "</td>";
        rows += "<td>" + selected_file.name + "</td>";
        rows += "<td class='small_cell text-right'>" + formatSizeUnits(selected_file.size) + "</td>";
        rows += "<td class='small_cell text-center progress_cell'></td>";
        rows += "</tr>";
    });

    let table = "";

    table += "<div class='table-responsive' id='selected_files'>";
    table += "<table class='table table-bordered'>";
    table += "<caption>Max " + file_constraints.max_files_count + " files allowed</caption>";

    if (rows !== "") {
        table += "<thead>";
        table += "<tr>";
        table += "<th class='small_cell'>#</th>";
        table += "<th class='small_cell'>Operations</th>";
        table += "<th>File</th>";
        table += "<th class='small_cell'>Size</th>";
        table += "<th class='small_cell'>Progress</th>";
        table += "</tr>";
        table += "</thead>";
        table += "<tbody>";
        table += rows;
        table += "</tbody>";
        table += "<tfoot>";
        table += "<tr>";
        table += "<th class='small_cell text-right' colspan='3'>Total</th>";
        table += "<th class='small_cell text-right'>" + formatSizeUnits(total_size) + "</th>";
        table += "</tr>";
        table += "</tfoot>";
    }

    table += "</table>";
    table += "</div>";

    return table;
}

function displaySelectedFiles() {
    let table = getSelectedFileTable();

    if ($("#upload_modal #selected_files").length) {
        $("#upload_modal #selected_files").replaceWith(table);
    } else {
        $("#upload_modal .modal-body").append(table);
    }
    dragAndDropFunctions();
}

function formatSizeUnits(bytes) {
    if (bytes >= (1024 * 1024 * 1024)) {
        bytes = (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    } else if (bytes >= (1024 * 1024)) {
        bytes = (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
        bytes = (bytes / 1024).toFixed(2) + ' KB';
    } else if (bytes > 1) {
        bytes = bytes + ' bytes';
    } else if (bytes === 1) {
        bytes = bytes + ' byte';
    } else {
        bytes = '0 bytes';
    }

    return bytes;
}

function removeSelectedFile(index) {
    index = Number(index);
    if (index > -1) {
        selected_files.splice(index, 1);
    }

    displaySelectedFiles();
}

let dropArea = null;

function dragAndDropFunctions() {
    // ************************ Drag and drop ***************** //
    dropArea = document.getElementById("selected_files")

// Prevent default drag behaviors
    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false)
        document.body.addEventListener(eventName, preventDefaults, false)
    })

// Highlight drop area when item is dragged over it
    ;['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false)
    })

    ;['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false)
    })

// Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false)
}

///drag and drop

function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
}

function highlight(e) {
    dropArea.classList.add('highlight')
}

function unhighlight(e) {
    dropArea.classList.remove('active')
}

function handleDrop(e) {
    var dt = e.dataTransfer;
    var files = dt.files;
    console.log(files);
    updateSelectedFileTable(files);
}
//# sourceMappingURL=index-47bea2db55.js.map
