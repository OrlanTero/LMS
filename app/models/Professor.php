<?php


namespace Application\models;

use Application\abstract\ProfessorAbstract;

class Professor extends ProfessorAbstract
{

    public $user;

    public $displayName;

    public function __construct($data = [])
    {
        $this->applyData($data, ProfessorAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;

        $this->user = $APPLICATION->FUNCTIONS->USER_CONTROL->get($this->user_id, true);

        $this->displayName = $this->user->displayName;

    }

    public function getClasses()
    {
        global $APPLICATION;

        return $APPLICATION->FUNCTIONS->SECTION_CONTROL->filterRecords(["adviser_id" => $this->professor_id], true);
    }
}