<?php



// ALL FINANCIAL


$GENDERS = array_column(GenderType::cases(), "value");

$ADMIN_USER_TYPES = array_column(AdminUserTypes::cases(), "value");

$ALL_USER_TYPES = array_column(UserTypes::cases(), "value");

$ALL_USER_TYPES_MINI = array_column(UserTypesMini::cases(), "value");

$USER_HEADER_BODY = [
    "header" => ["No","Name","First Name","Last Name","Email","Status", "Date Created"],
    "body" => ["no","displayName","firstname", "lastname","email","status", "date_created"]
];
