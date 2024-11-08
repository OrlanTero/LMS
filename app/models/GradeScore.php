<?php


namespace Application\models;

use Application\abstract\GradeScoreAbstract;

class GradeScore extends GradeScoreAbstract
{

    public $student_id;

    public function __construct($data = [])
    {
        $this->applyData($data, GradeScoreAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;

        if ($this->category == "Activity") {
            $comply = $APPLICATION->FUNCTIONS->ACTIVITY_COMPLY_CONTROL->get($this->id, false);
            $this->student_id = $comply['student_id'];
        } else {
            $this->student_id = false;
            // $exam = $APPLICATION->EXAM_COMPLY_CONTROL->get($this->id, false);
            // $this->student_id = $exam['student_id'];
        }
    }
}