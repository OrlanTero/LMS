<?php


namespace Application\models;

use Application\abstract\StaffAbstract;

class Staff extends StaffAbstract
{

    public $user;

    public $department;

    public $displayName;
    public function __construct($data = [])
    {
        $this->applyData($data, StaffAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;

        $this->user = $APPLICATION->FUNCTIONS->USER_CONTROL->get($this->user_id, true);
        $this->department = $APPLICATION->FUNCTIONS->DEPARTMENT_CONTROL->get($this->department_id, true);

        $this->displayName = $this->user->displayName;
    }
}