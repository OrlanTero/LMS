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

// ALL MODELS
include_once "models/User.php";
include_once "models/UserProfile.php";

// APP CONTROLLERS
include_once "controllers/app/Response.php";
include_once "controllers/app/GlobalFunctions.php";
include_once "controllers/app/EmailControl.php";

include_once "controllers/system/PostControl.php";
include_once "controllers/system/UserControl.php";

//include_once "controllers/app/SMSControl.php";

// SYSTEM CONTROLLERS
//include_once "controllers/system/UserControl.php";

// APPLICATION CORE
include_once "core/Session.php";
include_once "core/Connection.php";
include_once "core/Authentication.php";
include_once "core/Application.php";
include_once "core/Routes.php";