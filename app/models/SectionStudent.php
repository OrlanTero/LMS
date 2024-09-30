<?php


namespace Application\models;

use Application\abstract\CourseAbstract;
use Application\abstract\SectionAbstract;
use Application\abstract\SectionStudentAbstract;

class SectionStudent extends SectionStudentAbstract
{
    public $student;

    public $user_id;

    public $student_no;

    public $displayName;
    public function __construct($data = [])
    {
        $this->applyData($data, SectionStudentAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;

        $this->student = $APPLICATION->FUNCTIONS->USER_CONTROL->get($this->student_id, true);

        if ($this->student) {
            $this->user_id = $this->student->user_id;
            $this->student_no = $this->student->no;
            $this->displayName = $this->student->displayName;
        }
    }
}