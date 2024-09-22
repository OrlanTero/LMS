<?php

namespace Application\models;

use Application\abstract\UserProfileAbstract;

class UserProfile extends UserProfileAbstract
{
    protected $CONNECTION;

    public function __construct($userData = [])
    {
        global $CONNECTION;

        $this->CONNECTION = $CONNECTION;
        $this->applyData($userData, UserProfileAbstract::class);
        $this->init();
    }

    private function init(): void
    {

    }
}