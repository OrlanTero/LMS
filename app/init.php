<?php


// ALL MODULES
include_once "modules/Enumeration.php";
include_once "modules/Tool.php";
include_once "modules/AppResources.php";

// ALL MODEL ABSTRACTS
include_once "abstract/ModelDefaultFunctions.php";
include_once "abstract/ControlDefaultFunctions.php";
include_once "abstract/UserAbstract.php";
include_once "abstract/UserProfileAbstract.php";
include_once "abstract/CourseAbstract.php";
include_once "abstract/ProfessorAbstract.php";
include_once "abstract/ClassRoomAbstract.php";
include_once "abstract/SectionAbstract.php";
include_once "abstract/SubjectAbstract.php";
include_once "abstract/StudentAbstract.php";
include_once "abstract/SectionStudentAbstract.php";

// ALL MODELS
include_once "models/User.php";
include_once "models/UserProfile.php";
include_once "models/Course.php";
include_once "models/Professor.php";
include_once "models/Classroom.php";
include_once "models/Section.php";
include_once "models/Subject.php";
include_once "models/Student.php";
include_once "models/SectionStudent.php";

// APP CONTROLLERS
include_once "controllers/app/Response.php";
include_once "controllers/app/GlobalFunctions.php";
include_once "controllers/app/EmailControl.php";

include_once "controllers/system/PostControl.php";
include_once "controllers/system/UserControl.php";
include_once "controllers/system/CourseControl.php";
include_once "controllers/system/ProfessorControl.php";
include_once "controllers/system/ClassroomControl.php";
include_once "controllers/system/SectionControl.php";
include_once "controllers/system/SubjectControl.php";
include_once "controllers/system/StudentControl.php";
include_once "controllers/system/SectionStudentControl.php";

//include_once "controllers/app/SMSControl.php";

// SYSTEM CONTROLLERS
//include_once "controllers/system/UserControl.php";

// APPLICATION CORE
include_once "core/Session.php";
include_once "core/Connection.php";
include_once "core/Authentication.php";
include_once "core/Application.php";
include_once "core/Routes.php";