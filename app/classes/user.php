<?php
include_once "database.php";
include_once "../includes/functions.php";

class User extends Database {
    protected $file_constraints;

    function __construct() {
        parent::__construct();
        $this->init();
    }

    protected
    function init() {
        $this->file_constraints = [
            "max_files_count" => 10,
            "max_file_size"   => (15 * 1024 * 1024),
        ];
    }

    protected
    function userAdd() {
        $this->getLoggedInUser();
        $c_by = $_SESSION["logged_in_user"]["id"];
        $c_date = date("Y-m-d H:i:s");
        $query = "INSERT INTO " .
            "user_master " .
            "(name, email, usertype_id, memory_limit, created_by, created_date) " .
            "VALUES " .
            "('{$_POST['name']}', '{$_POST['email']}', 2, '{$_POST['memory_limit']}', '{$c_by}', '{$c_date}') ";

        $this->query($query);

        $data = [
            "message"        => setMessage("User added"),
            "users"          => $this->getUser(),
            "logged_in_user" => $_SESSION["logged_in_user"],
        ];

        echo json_encode($data);
    }

    protected
    function userEdit() {
        $this->getLoggedInUser();
        $c_by = $_SESSION["logged_in_user"]["id"];
        $c_date = date("Y-m-d H:i:s");

        $user_details = $this->getUser(" AND id = {$_POST['id']}");
        $user_details = $user_details[0];

        $memory_limit = "";
        if (isset($_POST['memory_limit'])) {
            if ((intval($user_details["usertype_id"]) === 2 && intval($_SESSION["logged_in_user"]["usertype_id"]) === 1) ||
                intval($user_details["usertype_id"]) === 1 && intval($_SESSION["logged_in_user"]["usertype_id"]) === 1) {
                $memory_limit = "memory_limit = '{$_POST['memory_limit']}', ";
            }
        }

        $query = "UPDATE " .
            "user_master " .
            "SET " .
            "name = '{$_POST['name']}', " .
            "email = '{$_POST['email']}', " .
            "{$memory_limit} " .
            "updated_by = '{$c_by}', " .
            "updated_date = '{$c_date}' " .
            "WHERE " .
            "id = {$_POST['id']} ";

        $this->query($query);

        $data = [
            "a"              => $user_details,
            "message"        => setMessage("User updated"),
            "users"          => $this->getUser(),
            "logged_in_user" => $this->getLoggedInUser(),
        ];

        echo json_encode($data);
    }

    protected
    function getLoggedInUser() {
        $user = $this->getUser(" AND id = {$_SESSION["logged_in_user"]["id"]}");
        $_SESSION["logged_in_user"] = $user[0];
        return $_SESSION["logged_in_user"];
    }

    protected
    function checkLogin() {
        $extra_query = " AND " .
            "email LIKE '{$_POST['email']}' AND " .
            "password LIKE '" . sha1($_POST['password']) . "' ";
        $user = $this->getUser($extra_query);
        $user = count($user) ? $user[0] : false;

        $data = [
            "logged_in_user"   => $user,
            "file_constraints" => $this->file_constraints,
        ];

        if ($user !== false) {
            $this->removeLoggedInSession();
            $_SESSION["logged_in_user"] = $user;

            if (intval($user["usertype_id"]) === 1) {
                $data["users"] = $this->getUser();
            } else {
                $data["user_files"] = $this->getUserFiles($user["id"]);
            }
        } else {
            $this->removeLoggedInSession();
        }

        echo json_encode($data);
    }

    protected
    function getUserFiles($id) {
        $path = "../files/{$id}";

        $files = getFiles($path);

        $data = [
            "files"      => [],
            "total_size" => 0,
        ];
        $total_size = 0;

        foreach ($files as $file) {
            $size = filesize("{$path}/{$file}");
            $total_size += $size;
            $data["files"][] = [
                "name" => $file,
                "size" => formatSizeUnits($size),
            ];
        }
        $data["total_size"] = formatSizeUnits($total_size);
        $data["total_size_bytes"] = $total_size;

        return $data;
    }

    protected
    function removeLoggedInSession() {
        if (isset($_SESSION["logged_in_user"])) {
            unset($_SESSION["logged_in_user"]);
        }
    }

    protected
    function getUser($extra_query = "") {

        $query = "SELECT " .
            "id, " .
            "name, " .
            "email, " .
            "usertype_id, " .
            "COALESCE(memory_limit,'0') AS memory_limit " .
            "FROM " .
            "user_master " .
            "WHERE " .
            "active = 1 " .
            "{$extra_query} " .
            "ORDER BY " .
            "name";

        return $this->find_by_sql($query);
    }

    protected
    function getEditProfile() {
        $this->getLoggedInUser();
        $_POST['id'] = $_SESSION["logged_in_user"]["id"];
        $this->getUserData();
    }

    protected
    function getUserData() {
        $extra_query = "";

        if (isset($_POST['id'])) {
            $extra_query = $_POST['id'] !== "" ? " AND id = {$_POST['id']} " : "";
        }

        $users = $this->getUser($extra_query);

        echo json_encode($users);
    }

    protected
    function isLoggedIn() {
        $data = [
            "logged_in_user" => false,
        ];

        if (isset($_SESSION["logged_in_user"])) {
            $data = [
                "logged_in_user"   => $this->getLoggedInUser(),
                "file_constraints" => $this->file_constraints,
            ];

            if (intval($data["logged_in_user"]["usertype_id"]) == 1) {//admin
                $data["users"] = $this->getUser();
            } else {
                $data["user_files"] = $this->getUserFiles($_SESSION["logged_in_user"]["id"]);
            }
        }

        echo json_encode($data);
    }

    protected
    function signOut() {
        $this->removeLoggedInSession();
        echo json_encode(setMessage("Successfully logged out"));
    }

    protected
    function changePassword() {
        $current_password = sha1($_POST['current_password']);
        $user_password = sha1($_POST['user_password']);
        $user_password_2 = sha1($_POST['user_password_2']);

        $id = $_SESSION["logged_in_user"]["id"];
        $query = "SELECT " .
            "COUNT(1) AS count " .
            "FROM " .
            "user_master " .
            "WHERE " .
            "id = {$id} AND " .
            "active = 1 AND " .
            "password LIKE '{$current_password}' ";
        $found = $this->find_by_sql($query);

        $data = [
            "logged_in_user" => false,
        ];

        if (intval($found[0]["count"])) {
            $id = isset($_POST['id']) ? $_POST['id'] : $_SESSION["logged_in_user"]["id"];

            $query = "UPDATE " .
                "user_master " .
                "SET " .
                "password = '{$user_password}' " .
                "WHERE " .
                "id = {$id} ";
            $this->query($query);

            $data = [
                "logged_in_user" => $this->getLoggedInUser(),
            ];

            $data["users"] = $this->getUser();
            $data["message"] = setMessage("Password successfully updated");
        }
        echo json_encode($data);
    }

    protected
    function fileUpload() {

        if (isset($_SESSION["logged_in_user"])) {
            $path = "../files/{$_SESSION["logged_in_user"]["id"]}/";
            createFolders($path);
            $data = $this->saveFile($path);
            $data["user_files"] = $this->getUserFiles($_SESSION["logged_in_user"]["id"]);
            echo json_encode($data);
        } else {
            echo json_encode(setError("Unauthorised Access"));
        }
    }

    protected
    function saveFile($path) {
        $used_memory = $this->getUserFiles($_SESSION["logged_in_user"]["id"]);
        $used_memory = $used_memory["total_size_bytes"];
        $memory_limit = $_SESSION["logged_in_user"]["memory_limit"] * 1024 * 1024;

        $uploadOk = 1;
        $file_var = "user_files";
        $target_file = $path . basename($_FILES[$file_var]["name"]);

        $file_name = explode(".", $_FILES[$file_var]["name"]);
        $file_ext = array_pop($file_name);

        if (file_exists($target_file)) {
            $uploadOk = 0;
        }

        if ($_FILES[$file_var]["size"] > intval($this->file_constraints["max_file_size"])) {
            $uploadOk = -1;
        }

        if (($_FILES[$file_var]["size"] + $used_memory) > $memory_limit) {
            $uploadOk = -3;
        }

        if (($used_memory) > $memory_limit) {
            $uploadOk = -4;
        }

        if ($uploadOk === 1) {
            if (move_uploaded_file($_FILES[$file_var]["tmp_name"], $target_file)) {
                $uploadOk = 2;
            } else {
                $uploadOk = -2;
            }
        }

        switch ($uploadOk) {
            case 2:
                $message = setMessage("File Uploaded successfully");
                break;
            case 0:
                $message = setError("File already exist");
                break;
            case -1:
                $message = setError("File size is too large");
                break;
            case -2:
                $message = setError("Error in saving file on server");
                break;
            case -3:
                $message = setError("Cannot exceed allocated memory");
                break;
            case -4:
                $message = setError("Total allocated memory used");
                break;
        }

        return [
            "status"  => $uploadOk,
            "message" => $message,
        ];
    }

    protected
    function deleteFile() {
        if (isset($_SESSION["logged_in_user"])) {
            $path = "../files/{$_SESSION["logged_in_user"]["id"]}/";
            $file_path = "{$path}/{$_POST['file']}";

            if (file_exists($file_path)) {
                unlink($file_path);
            }

            $data["user_files"] = $this->getUserFiles($_SESSION["logged_in_user"]["id"]);
            $data["message"] = setMessage("File sucessfully deleted");
            echo json_encode($data);
        } else {
            echo json_encode(setError("Unauthorised Access"));
        }
    }

    protected
    function downloadFile() {
        $path = "../files/{$_SESSION["logged_in_user"]["id"]}/";
        $file_path = "{$path}/{$_GET['file']}";
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename=' . $_GET['f']);
        readfile($file_path);
        exit;
    }

    protected
    function deleteUser() {
        $this->getLoggedInUser();
        $c_by = $_SESSION["logged_in_user"]["id"];
        $c_date = date("Y-m-d H:i:s");

        $message = setMessage("User deleted");

        if (intval($_POST['user_id']) === intval($_SESSION["logged_in_user"]["id"])) {
            $message = setError("Cannot delete urself");
        } else {
            $query = "UPDATE " .
                "user_master " .
                "SET " .
                "active = 0, " .
                "updated_by = '{$c_by}', " .
                "updated_date = '{$c_date}' " .
                "WHERE " .
                "id = {$_POST['user_id']} ";

            $this->query($query);
        }


        $data = [
            "message"        => $message,
            "users"          => $this->getUser(),
            "logged_in_user" => $this->getLoggedInUser(),
        ];

        echo json_encode($data);
    }
}

$user_ob = new User();