<?php

include_once "../includes/config.php";

class Database {
    public $connection;

    function __construct() {
        $this->init();
        $this->openConnection();
    }

    protected
    function init() {
    }

    public
    function openConnection() {
        $this->connection = mysqli_connect(DB_SERVER, DB_USER, DB_PASS, DB_NAME);
        $this->processOperation();
    }

    public
    function processOperation() {
        $current_operation = isset($_GET['operation']) ? $_GET['operation'] : (isset($_POST['operation']) ? $_POST['operation'] : NULL);

        $operation = $current_operation;

        if ($operation !== NULL) {
            $operation = strtolower($operation);
            $operation = explode("_", $operation);

            for ($i = 1; $i < count($operation); $i++) {
                $operation[$i] = ucwords($operation[$i]);
            }

            $operation = implode("", $operation);

            if (method_exists($this, $operation)) {
                call_user_func([$this, $operation]);
            }
        }
    }

    public
    function query($query) {
        $result = mysqli_query($this->connection, $query);
        $this->confirm_query($result, $query);
        return $result;
    }

    public
    function stopScript($message = "") {
        die($message . mysqli_connect_error() . " (" . mysqli_connect_errno() . ")");
    }

    public
    function confirm_query($result, $sql) {
        if (!$result) {
            $this->stopScript("Database query failed. {$sql}");
        }
    }

    public
    function find_by_sql($query) {
        $result_set = $this->query($query);
        $row_array = [];
        while ($row = $this->fetch_array($result_set)) {
            $row = array_map('utf8_encode', $row);
            $row_array[] = $row;
        }
        return $row_array;
    }

    public
    function fetch_array($result_set) {
        return mysqli_fetch_assoc($result_set);
    }

    public
    function close_connection() {
        if (isset($this->connection)) {
            mysqli_close($this->connection);
            unset($this->connection);
        }
    }

    public
    function escape_value($string) {
        $string = trim($string);
        $string = strip_tags($string);
        $string = htmlentities($string, ENT_NOQUOTES);
        return mysqli_real_escape_string($this->connection, $string);
    }

    public
    function insert_id() {
        // get the last id inserted over the current db connection
        return mysqli_insert_id($this->connection);
    }

    public
    function affected_rows() {
        return mysqli_affected_rows($this->connection);
    }

    public
    function num_rows($result_set) {
        return mysqli_num_rows($result_set);
    }
}

