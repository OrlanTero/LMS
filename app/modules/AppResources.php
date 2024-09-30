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

$STUDENT_IN_SECTION_HEADER_BODY = [
    "header" => ["No","Student No","Student ID","Name"],
    "body" => ["no","student_no", "student_id","displayName"]
];

$COURSE_HEADER_BODY = [
    "header" => ["No","Name","Description","Status", "Date Created"],
    "body" => ["no","course_name","description","status", "date_created"]
];

$PROFESSORS_HEADER_BODY = [
    "header" => ["No","Name","Description","Main Course","Status", "Date Created"],
    "body" => ["no","user_id","description","main_course_id","status", "date_created"]
];

$CLASSROOMS_HEADER_BODY = [
    "header" => ["No","Name","Building","Floor","Status", "Date Created"],
    "body" => ["no","classroom_name","building","floor","status", "date_created"]
];

$SECTIONS_HEADER_BODY = [
    "header" => ["No","Name","Adviser","Course","Semester","Year Level","Status", "Date Created"],
    "body" => ["no","section_name","adviser_id","course_id","semester","year_level","status", "date_created"]
];

$SUBJECTS_HEADER_BODY = [
    "header" => ["No","Name","Course","Status", "Date Created"],
    "body" => ["no","subject_name","course_id","status", "date_created"]
];
