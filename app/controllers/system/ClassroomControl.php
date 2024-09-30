<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\abstract\CourseAbstract;
use Application\abstract\UserAbstract;
use Application\models\Classroom;
use Application\models\Course;
use Application\models\User;

class ClassroomControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = Classroom::class;
    protected $TABLE_NAME = "classrooms";
    protected $TABLE_PRIMARY_ID = "classroom_id";
    protected $SEARCH_LOOKUP = ["classroom_name", "building", "floor"];

    public function add($data)
    {
        return null;
    }

    public function update($id, $data)
    {
        return null;
    }
}