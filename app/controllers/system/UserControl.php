<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\abstract\UserAbstract;
use Application\models\User;

class UserControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = User::class;
    protected $TABLE_NAME = "users";
    protected $TABLE_PRIMARY_ID = "user_id";
    protected $SEARCH_LOOKUP = ["displayName", "firstname", "lastname", "email"];

    public function add($data)
    {
        $data['password'] = md5($data['password']);

        return $this->addRecord($data);
    }
}