let empty_object = {
    "id": "",
    "name": "",
    "email": "",
    "memory_limit": "",
    "operation": "singup"
};

let logged_in_object = empty_object;

$(document).ready(function () {
    isLoggedIn();

    // getUserData();

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
            changePassword();
        }
        return false;
    });

    $(document).on("submit", "#file_upload_form", function () {
        if (isFilesValid()) {
            uploadFiles();
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
        gui += "<td>" + file.name + "</td>";
        gui += "<td class='small_cell text-right'>" + file.size + "</td>";
        gui += "</tr>";
    });

    gui += "</tbody>";
    gui += "</table>";
    gui += "</div>";
    gui += "</div>";
    gui += "</div>";

    $("#main_container").html(gui);
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
    gui += "<input type='file' class='form-control' id='user_file'>";
    gui += "</div>";
    gui += "</div>";

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
                if (json_ob.logged_in_user === false) {
                    displayLoginForm(empty_object);
                } else {
                    logged_in_object = json_ob.logged_in_user;

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

function changePassword() {
    $.ajax({
        url: "../classes/user.php",
        beforeSend: function () {
        },
        data: {
            operation: "change_password",
            current_password: $("#change_password_form #current_user_password").val(),
            user_password: $("#change_password_form #user_password").val(),
            user_password_2: $("#change_password_form #user_password_2").val()
        },
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

function uploadFiles() {
    var file_data = $('#user_file').prop('files')[0];
    var form_data = new FormData();
    form_data.append('user_files', file_data);
    form_data.append('operation', "file_upload");

    $.ajax({
        url: "../classes/user.php",
        beforeSend: function () {
        },
        cache: false,
        contentType: false,
        processData: false,
        data: form_data,
        type: "POST",
        success: function (response) {
            var json_ob = JSON.parse(response);
            if (json_ob !== false) {
                if (JSON.parse(json_ob.status) === 2) {
                    destroyModal($("#upload_modal"));
                    displayUserFiles(json_ob);
                }
                showAlert(json_ob.message);
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
//# sourceMappingURL=index-5d10be43ab.js.map
