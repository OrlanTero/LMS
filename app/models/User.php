<?php


namespace Application\models;

use Application\abstract\UserAbstract;

class User extends UserAbstract
{
    protected $CONNECTION;

    public $photoURL;
    public $typeName;

    public function __construct($userData = [])
    {
        global $CONNECTION;

        $this->CONNECTION = $CONNECTION;
        $this->applyData($userData, UserAbstract::class);
        $this->init();
    }

    public function init(): void
    {
        global $ALL_USER_TYPES;

        $EXTENSION = 'jpg';
        $CHARACTER_AVATAR_PATH = '/public/assets/media/avatar/' . '/';

        if (!$this->displayName) {
            $this->displayName = $this->firstname . ' ' . $this->lastname;
            $this->CONNECTION->Update("users", ["displayName" => $this->displayName], ["user_id" => $this->user_id]);
        }

        $this->photoURL = strlen($this->image) > 0 ? $this->image : $CHARACTER_AVATAR_PATH . strtoupper($this->displayName[0]) . '.' . $EXTENSION;
        $this->typeName = $ALL_USER_TYPES[$this->user_type - 1];
    }

    public function isType($type)
    {
        return $type == $this->user_type;
    }
}