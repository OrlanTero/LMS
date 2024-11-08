<?php


namespace Application\models;

use Application\abstract\ActivityComplyAbstract;

class ActivityComply extends ActivityComplyAbstract
{
    public $student;
    public $grade_score;

    public function __construct($data = [])
    {
        $this->applyData($data, ActivityComplyAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;

        $this->student = $APPLICATION->FUNCTIONS->USER_CONTROL->get($this->student_id, false);
        $this->grade_score = $this->getGradeScore();
    }

    public function getGradeScore()
    {
        global $APPLICATION;

        return $APPLICATION->FUNCTIONS->GRADE_SCORE_CONTROL->getByWhere([
            'category' => "Activity",
            'id' => $this->comply_id
        ], false);
    }
}