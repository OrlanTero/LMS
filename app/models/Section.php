<?php


namespace Application\models;

use Application\abstract\CourseAbstract;
use Application\abstract\SectionAbstract;

class Section extends SectionAbstract
{

    public $subjects;
    public function __construct($data = [])
    {
        $this->applyData($data, SectionAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;

        $this->subjects = $APPLICATION->FUNCTIONS->SECTION_SUBJECT_CONTROL->filterRecords(['section_id' => $this->section_id], true);
    }

    public function getAllStudents()
    {
        global $APPLICATION;

        return $APPLICATION->FUNCTIONS->SECTION_STUDENT_CONTROL->filterRecords(['section_id' => $this->section_id], false);
    }
}