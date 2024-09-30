<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\abstract\UserAbstract;
use Application\models\Student;
use Application\models\User;

class StudentControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = Student::class;
    protected $TABLE_NAME = "users";
    protected $TABLE_PRIMARY_ID = "user_id";
    protected $SEARCH_LOOKUP = ["displayName", "firstname", "lastname", "email", "no"];

    public function add($data)
    {
        $data['password'] = md5($data['password']);

        return $this->addRecord($data);
    }

    public function getAll($asObject = false)
    {
        return $this->filterRecords(['user_type' => 1], $asObject);
    }
}