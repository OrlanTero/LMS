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
include_once "abstract/DepartmentAbstract.php";
include_once "abstract/SectionSubjectAbstract.php";
include_once "abstract/StaffAbstract.php";
include_once "abstract/ScheduleAbstract.php";
include_once "abstract/ScheduleItemAbstract.php";
include_once "abstract/PostAbstract.php";
include_once "abstract/PostMediaAbstract.php";
include_once "abstract/AnnouncementAbstract.php";
include_once "abstract/ResourcesAbstract.php";
include_once "abstract/ResourcesGroupAbstract.php";
include_once "abstract/ActivityAbstract.php";
include_once "abstract/ExamAbstract.php";
include_once "abstract/StickyNoteAbstract.php";
include_once "abstract/PostLikeAbstract.php";
include_once "abstract/grading/GradingScoreAbstract.php";
include_once "abstract/grading/GradingScoreColumnAbstract.php";
include_once "abstract/grading/GradingPlatformAbstract.php";
include_once "abstract/grading/GradingCategoriesAbstract.php";
include_once "abstract/PostCommentAbstract.php";
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
include_once "models/Department.php";
include_once "models/SectionSubject.php";
include_once "models/Staff.php";
include_once "models/Schedule.php";
include_once "models/ScheduleItem.php";
include_once "models/Post.php";
include_once "models/PostMedia.php";
include_once "models/Announcement.php";
include_once "models/Resources.php";
include_once "models/ResourcesGroup.php";
include_once "models/Activity.php";
include_once "models/Exam.php";
include_once "models/StickyNote.php";
include_once "models/PostLike.php";
include_once "models/PostComment.php";
include_once "models/GradingCategory.php";
include_once "models/GradingScore.php";
include_once "models/GradingScoreColumn.php";
include_once "models/GradingPlatform.php";

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
include_once "controllers/system/DepartmentControl.php";
include_once "controllers/system/SectionSubjectControl.php";
include_once "controllers/system/StaffControl.php";
include_once "controllers/system/ScheduleControl.php";
include_once "controllers/system/ScheduleItemControl.php";
include_once "controllers/system/PostsControl.php";
include_once "controllers/system/PostMediaControl.php";
include_once "controllers/system/AnnouncementControl.php";
include_once "controllers/system/ResourcesControl.php";
include_once "controllers/system/ResourcesGroupControl.php";
include_once "controllers/system/ActivityControl.php";
include_once "controllers/system/ExamControl.php";
include_once "controllers/system/StickyNoteControl.php";
include_once "controllers/system/PostLikeControl.php";
include_once "controllers/system/GradingCategoryControl.php";
include_once "controllers/system/GradingScoreControl.php";
include_once "controllers/system/GradingScoreColumnControl.php";
include_once "controllers/system/GradingPlatformControl.php";
include_once "controllers/system/PostCommentControl.php";
// SYSTEM CONTROLLERS

// APPLICATION CORE
include_once "core/Session.php";
include_once "core/Connection.php";
include_once "core/Authentication.php";
include_once "core/Application.php";
include_once "core/Routes.php";