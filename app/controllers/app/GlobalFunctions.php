<?php

namespace Application\controllers\app;

use Application\controllers\system\AnnouncementControl;
use Application\controllers\system\ClassroomControl;
use Application\controllers\system\CourseControl;
use Application\controllers\system\DepartmentControl;
use Application\controllers\system\PostControl;
use Application\controllers\system\PostMediaControl;
use Application\controllers\system\PostsControl;
use Application\controllers\system\ProfessorControl;
use Application\controllers\system\ScheduleControl;
use Application\controllers\system\ScheduleItemControl;
use Application\controllers\system\SectionControl;
use Application\controllers\system\SectionStudentControl;
use Application\controllers\system\SectionSubjectControl;
use Application\controllers\system\StaffControl;
use Application\controllers\system\StudentControl;
use Application\controllers\system\SubjectControl;
use Application\controllers\system\UserControl;
use Application\models\Professor;
use Application\models\Section;

class GlobalFunctions
{
    protected $CONNECTION;
    protected $KLEIN;
    protected $SESSION;
    public $isAdmin;

    public $EMAIL_CONTROL;

    public $POST_CONTROL;

    public $USER_CONTROL;

    public $COURSE_CONTROL;

    public $PROFESSOR_CONTROL;

    public $CLASSROOM_CONTROL;

    public $SECTION_CONTROL;

    public $SUBJECT_CONTROL;

    public $STUDENT_CONTROL;
    public $SECTION_STUDENT_CONTROL;
    public $DEPARTMENT_CONTROL;
    public $SECTION_SUBJECT_CONTROL;

    public $STAFF_CONTROL;
    public $SCHEDULE_CONTROL;
    public $SCHEDULE_ITEM_CONTROL;

    public $POSTS_CONTROL;

    public $POST_MEDIA_CONTROL;

    public $ANNOUNCEMENT_CONTROL;

    public function __construct($SESSION)
    {
        global $CONNECTION;
        global $KLEIN;

        $this->SESSION = $SESSION;
        $this->CONNECTION = $CONNECTION;
        $this->KLEIN = $KLEIN;
        $this->isAdmin = $SESSION->isAdmin;

        $this->EMAIL_CONTROL = new EmailControl();

        $this->POST_CONTROL = new PostControl();

        $this->USER_CONTROL = new UserControl();

        $this->COURSE_CONTROL = new CourseControl();

        $this->PROFESSOR_CONTROL = new ProfessorControl();

        $this->STAFF_CONTROL = new StaffControl();

        $this->CLASSROOM_CONTROL = new ClassroomControl();

        $this->SECTION_CONTROL = new SectionControl();

        $this->SUBJECT_CONTROL = new SubjectControl();

        $this->STUDENT_CONTROL = new StudentControl();

        $this->SECTION_STUDENT_CONTROL = new SectionStudentControl();

        $this->DEPARTMENT_CONTROL = new DepartmentControl();

        $this->SECTION_SUBJECT_CONTROL = new SectionSubjectControl();

        $this->SCHEDULE_CONTROL = new ScheduleControl();

        $this->SCHEDULE_ITEM_CONTROL = new ScheduleItemControl();

        $this->POSTS_CONTROL = new PostsControl();

        $this->POST_MEDIA_CONTROL = new PostMediaControl();

        $this->ANNOUNCEMENT_CONTROL = new AnnouncementControl();;
    }
}