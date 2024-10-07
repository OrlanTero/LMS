<?php


namespace Application\models;

use Application\abstract\StudentAbstract;
use Application\abstract\UserAbstract;

class Student extends StudentAbstract
{
    protected $CONNECTION;

    public $photoURL;
    public $typeName;


    // section


    public function __construct($userData = [])
    {
        global $CONNECTION;

        $this->CONNECTION = $CONNECTION;
        $this->applyData($userData, UserAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $ALL_USER_TYPES;

        $EXTENSION = 'jpg';
        $CHARACTER_AVATAR_PATH = '/public/assets/media/avatar/' . $EXTENSION . '/';

        if (!$this->displayName) {
            $this->displayName = $this->firstname . ' ' . $this->lastname;
            $this->CONNECTION->Update("users", ["displayName" => $this->displayName], ["user_id" => $this->user_id]);
        }

        $this->photoURL = strlen($this->image) > 0 ? $this->image : $CHARACTER_AVATAR_PATH . strtoupper($this->displayName[0]) . '.' . $EXTENSION;
        $this->typeName = $ALL_USER_TYPES[0];


        $this->initOther();
    }

    private function initOther()
    {
        global $APPLICATION;


    }

    public function getSectionStudent() {
        global $APPLICATION;

        return $APPLICATION->FUNCTIONS->SECTION_STUDENT_CONTROL->getBy("student_id", $this->user_id, true);
    }
}