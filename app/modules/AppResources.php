<?php



// ALL FINANCIAL


use Application\controllers\system\CourseControl;
use Application\controllers\system\ProfessorControl;
use Application\controllers\system\SubjectControl;

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


$STAFFS_HEADER_BODY = [
    "header" => ["No","Name","Description","Department","Status", "Date Created"],
    "body" => ["no","user_id","description","department_id","status", "date_created"]
];

$CLASSROOMS_HEADER_BODY = [
    "header" => ["No","Name","Building","Floor","Status", "Date Created"],
    "body" => ["no","classroom_name","building","floor","status", "date_created"]
];

$SECTIONS_HEADER_BODY = [
    "header" => ["No","Name","Adviser","Course","Semester","Year Level","Status", "Date Created"],
    "body" => ["no","section_name",[
        "primary" => "adviser_id",
        "controller" => ProfessorControl::class,
        "value" =>  "displayName"
    ],[
        "primary" => "course_id",
        "controller" => CourseControl::class,
        "value" =>  "course_name"
    ],[
        "enum" => array_column(Semesters::cases(), 'name'),
        "value" => "semester"
    ],[
        "enum" => array_column(YearLevels::cases(), 'name'),
        "value" => "year_level"
    ],"status", "date_created"]
];

$SUBJECTS_HEADER_BODY = [
    "header" => ["No","Name","Course","Status", "Date Created"],
    "body" => ["no","subject_name","course_id","status", "date_created"]
];

$DEPARTMENTS_HEADER_BODY = [
    "header" => ["No","Department Name","Head","Status", "Date Created"],
    "body" => ["no","department_name","head","status", "date_created"]
];

$SECTION_SUBJECT_HEADER_BODY = [
    "header" => ["No","Subject","Professor", "Schedule"],
    "body" => ["no",[
        "primary" => "subject_id",
        "controller" => SubjectControl::class,
        "value" =>  "subject_name"
    ],[
        "primary" => "professor_id",
        "controller" => ProfessorControl::class,
        "value" =>  "displayName"
    ], "schedule_label"]
];
