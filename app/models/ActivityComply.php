<?php


namespace Application\models;

use Application\abstract\ActivityComplyAbstract;

class ActivityComply extends ActivityComplyAbstract
{
    public $student;
    public function __construct($data = [])
    {
        $this->applyData($data, ActivityComplyAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;

        $this->student = $APPLICATION->FUNCTIONS->USER_CONTROL->get($this->student_id, false);
    }
}